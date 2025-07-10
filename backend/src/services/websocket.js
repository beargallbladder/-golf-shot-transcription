const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { cache } = require('../config/redis');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
    this.rooms = new Map(); // roomId -> Set of userIds
    this.heartbeat = new Map(); // connectionId -> timestamp
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      clientTracking: true
    });

    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    // Heartbeat to keep connections alive
    setInterval(() => {
      this.pingClients();
    }, 30000); // 30 seconds

    console.log('🔌 WebSocket server initialized');
  }

  async handleConnection(ws, request) {
    const connectionId = this.generateId();
    ws.connectionId = connectionId;
    
    console.log('🔗 New WebSocket connection:', connectionId);

    // Authenticate user
    const token = this.extractToken(request);
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      ws.email = decoded.email;
      
      // Store connection
      this.addClient(decoded.userId, ws);
      
      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        data: {
          connectionId,
          userId: decoded.userId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ WebSocket auth failed:', error);
      ws.close(1008, 'Invalid token');
      return;
    }

    // Handle messages
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    // Handle disconnect
    ws.on('close', () => {
      this.handleDisconnect(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Pong response for heartbeat
    ws.on('pong', () => {
      this.heartbeat.set(connectionId, Date.now());
    });
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);
      const { type, payload } = message;

      switch (type) {
        case 'join_leaderboard':
          this.joinLeaderboardRoom(ws, payload);
          break;
          
        case 'leave_leaderboard':
          this.leaveLeaderboardRoom(ws, payload);
          break;
          
        case 'shot_update':
          this.handleShotUpdate(ws, payload);
          break;
          
        case 'challenge_user':
          this.handleChallenge(ws, payload);
          break;
          
        case 'heartbeat':
          this.heartbeat.set(ws.connectionId, Date.now());
          break;
          
        default:
          console.warn('⚠️ Unknown message type:', type);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  joinLeaderboardRoom(ws, payload) {
    const { category = 'distance', timeframe = 'week' } = payload;
    const roomId = `leaderboard:${category}:${timeframe}`;
    
    // Leave previous rooms
    this.leaveAllRooms(ws);
    
    // Join new room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId).add(ws.userId);
    ws.currentRoom = roomId;
    
    console.log(`👥 User ${ws.userId} joined room: ${roomId}`);
    
    // Send current leaderboard data
    this.sendLeaderboardUpdate(roomId);
  }

  leaveLeaderboardRoom(ws, payload) {
    this.leaveAllRooms(ws);
  }

  async handleShotUpdate(ws, payload) {
    const { shotData } = payload;
    
    // Broadcast to leaderboard rooms
    const leaderboardRooms = Array.from(this.rooms.keys())
      .filter(roomId => roomId.startsWith('leaderboard:'));
    
    for (const roomId of leaderboardRooms) {
      await this.sendLeaderboardUpdate(roomId);
    }
    
    // Notify friends/followers
    await this.notifyFollowers(ws.userId, {
      type: 'friend_shot_update',
      data: {
        userId: ws.userId,
        shot: shotData,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`📊 Shot update broadcast for user ${ws.userId}`);
  }

  async handleChallenge(ws, payload) {
    const { targetUserId, challengeType, shotId } = payload;
    
    // Send challenge to target user
    this.sendToUser(targetUserId, {
      type: 'challenge_received',
      data: {
        fromUserId: ws.userId,
        challengeType,
        shotId,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`⚔️ Challenge sent from ${ws.userId} to ${targetUserId}`);
  }

  async sendLeaderboardUpdate(roomId) {
    try {
      // Try to get from cache first
      let leaderboardData = await cache.get(`leaderboard_ws:${roomId}`);
      
      if (!leaderboardData) {
        // Fetch fresh data (implement your leaderboard logic)
        leaderboardData = await this.fetchLeaderboardData(roomId);
        
        // Cache for 30 seconds
        await cache.set(`leaderboard_ws:${roomId}`, leaderboardData, 30);
      }
      
      // Send to all users in room
      const userIds = this.rooms.get(roomId) || new Set();
      for (const userId of userIds) {
        this.sendToUser(userId, {
          type: 'leaderboard_update',
          data: leaderboardData
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to send leaderboard update:', error);
    }
  }

  async fetchLeaderboardData(roomId) {
    // Parse room info
    const [_, category, timeframe] = roomId.split(':');
    
    // Mock data - replace with actual database query
    return {
      category,
      timeframe,
      leaders: [
        { userId: 1, name: 'John Doe', distance: 285, rank: 1 },
        { userId: 2, name: 'Jane Smith', distance: 280, rank: 2 },
        { userId: 3, name: 'Mike Johnson', distance: 275, rank: 3 }
      ],
      timestamp: new Date().toISOString()
    };
  }

  async notifyFollowers(userId, message) {
    try {
      // Get user's followers (implement your follower logic)
      const followers = await this.getUserFollowers(userId);
      
      for (const followerId of followers) {
        this.sendToUser(followerId, message);
      }
      
    } catch (error) {
      console.error('❌ Failed to notify followers:', error);
    }
  }

  sendToUser(userId, message) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.forEach(ws => {
        this.sendToClient(ws, message);
      });
    }
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send message:', error);
      }
    }
  }

  sendError(ws, message) {
    this.sendToClient(ws, {
      type: 'error',
      data: { message }
    });
  }

  addClient(userId, ws) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);
    this.heartbeat.set(ws.connectionId, Date.now());
  }

  removeClient(userId, ws) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.clients.delete(userId);
      }
    }
    this.heartbeat.delete(ws.connectionId);
  }

  leaveAllRooms(ws) {
    for (const [roomId, userIds] of this.rooms.entries()) {
      userIds.delete(ws.userId);
      if (userIds.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    ws.currentRoom = null;
  }

  handleDisconnect(ws) {
    console.log('🔌 WebSocket disconnected:', ws.connectionId);
    
    if (ws.userId) {
      this.removeClient(ws.userId, ws);
      this.leaveAllRooms(ws);
    }
  }

  pingClients() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds
    
    this.wss.clients.forEach(ws => {
      const lastHeartbeat = this.heartbeat.get(ws.connectionId) || 0;
      
      if (now - lastHeartbeat > timeout) {
        console.log('💀 Terminating dead connection:', ws.connectionId);
        ws.terminate();
        return;
      }
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }

  extractToken(request) {
    const url = new URL(request.url, 'ws://localhost');
    return url.searchParams.get('token');
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async getUserFollowers(userId) {
    // Mock implementation - replace with actual database query
    return [];
  }

  // Public API for broadcasting system events
  broadcastToAll(message) {
    this.wss.clients.forEach(ws => {
      this.sendToClient(ws, message);
    });
  }

  broadcastToRoom(roomId, message) {
    const userIds = this.rooms.get(roomId);
    if (userIds) {
      userIds.forEach(userId => {
        this.sendToUser(userId, message);
      });
    }
  }

  getStats() {
    return {
      totalConnections: this.wss.clients.size,
      uniqueUsers: this.clients.size,
      activeRooms: this.rooms.size,
      roomDetails: Object.fromEntries(
        Array.from(this.rooms.entries()).map(([roomId, userIds]) => [
          roomId, 
          userIds.size
        ])
      )
    };
  }
}

module.exports = new WebSocketManager();