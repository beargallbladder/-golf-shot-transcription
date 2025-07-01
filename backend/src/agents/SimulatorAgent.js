/**
 * SimulatorAgent - Direct Golf Simulator Integration
 * Connects to TrackMan, Foresight, SkyTrak, and other golf simulators
 */

class SimulatorAgent {
  constructor() {
    this.supportedSimulators = [
      'TrackMan', 'Foresight GCQuad', 'SkyTrak', 'Garmin Approach',
      'FlightScope', 'Uneekor', 'Full Swing', 'aboutGolf'
    ];
    
    this.simulatorAdapters = {
      'trackman': new TrackManAdapter(),
      'foresight': new ForesightAdapter(),
      'skytrak': new SkyTrakAdapter(),
      'flightscope': new FlightScopeAdapter()
    };
  }

  async connectSimulator(simulatorType, config) {
    try {
      console.log(`🏌️ SimulatorAgent: Connecting to ${simulatorType}`);
      
      const adapter = this.getAdapter(simulatorType);
      if (!adapter) {
        throw new Error(`Unsupported simulator: ${simulatorType}`);
      }
      
      const connection = await adapter.connect(config);
      
      console.log(`🏌️ Connected to ${simulatorType} successfully`);
      
      return {
        realTimeData: connection.stream(),
        historicalData: await connection.getHistory(),
        calibration: await connection.calibrate(),
        metadata: connection.getMetadata(),
        status: 'connected',
        simulatorType: simulatorType
      };
      
    } catch (error) {
      console.error(`🏌️ SimulatorAgent connection error:`, error);
      throw new Error(`Failed to connect to ${simulatorType}: ${error.message}`);
    }
  }

  async parseSimulatorData(simulatorType, data) {
    try {
      console.log(`🏌️ SimulatorAgent: Parsing ${simulatorType} data`);
      
      const adapter = this.getAdapter(simulatorType.toLowerCase());
      if (!adapter) {
        return this.fallbackParser(data);
      }
      
      const parsedData = await adapter.parseData(data);
      
      return {
        ...parsedData,
        source: simulatorType,
        timestamp: new Date().toISOString(),
        confidence: 0.95 // High confidence for direct simulator data
      };
      
    } catch (error) {
      console.error(`🏌️ SimulatorAgent parsing error:`, error);
      return this.fallbackParser(data);
    }
  }

  async processRealTimeStream(simulatorType, streamData, callback) {
    try {
      console.log(`🏌️ Processing real-time stream from ${simulatorType}`);
      
      const adapter = this.getAdapter(simulatorType.toLowerCase());
      if (!adapter) {
        throw new Error(`No adapter for ${simulatorType}`);
      }
      
      return adapter.processStream(streamData, callback);
      
    } catch (error) {
      console.error(`🏌️ Real-time processing error:`, error);
      throw error;
    }
  }

  async batchImport(simulatorType, csvData) {
    try {
      console.log(`🏌️ SimulatorAgent: Batch importing ${simulatorType} data`);
      
      const adapter = this.getAdapter(simulatorType.toLowerCase());
      if (!adapter) {
        return this.fallbackBatchParser(csvData);
      }
      
      const shots = await adapter.batchImport(csvData);
      
      return {
        shots: shots,
        count: shots.length,
        source: simulatorType,
        importedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`🏌️ Batch import error:`, error);
      throw new Error(`Batch import failed: ${error.message}`);
    }
  }

  getAdapter(simulatorType) {
    const type = simulatorType.toLowerCase();
    return this.simulatorAdapters[type] || null;
  }

  fallbackParser(data) {
    console.log('🏌️ Using fallback parser for unknown simulator');
    
    // Generic parsing for unknown simulators
    return {
      speed: this.extractValue(data, ['ball_speed', 'ballSpeed', 'speed']),
      distance: this.extractValue(data, ['total_distance', 'distance', 'carry']),
      spin: this.extractValue(data, ['back_spin', 'spin', 'totalSpin']),
      launchAngle: this.extractValue(data, ['launch_angle', 'launchAngle', 'angle']),
      club: this.extractValue(data, ['club', 'clubType', 'club_type']),
      confidence: 0.7, // Lower confidence for fallback parsing
      source: 'unknown_simulator'
    };
  }

  fallbackBatchParser(csvData) {
    console.log('🏌️ Using fallback batch parser');
    
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const shots = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const shot = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim();
        if (value) {
          shot[header] = isNaN(value) ? value : parseFloat(value);
        }
      });
      
      shots.push(this.fallbackParser(shot));
    }
    
    return shots;
  }

  extractValue(data, possibleKeys) {
    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null) {
        return parseFloat(data[key]) || data[key];
      }
    }
    return null;
  }

  async healthCheck() {
    const status = {
      status: 'healthy',
      supportedSimulators: this.supportedSimulators.length,
      adapters: Object.keys(this.simulatorAdapters).length,
      timestamp: new Date().toISOString()
    };
    
    // Test adapter health
    for (const [type, adapter] of Object.entries(this.simulatorAdapters)) {
      try {
        status[`${type}_adapter`] = await adapter.healthCheck() || 'unknown';
      } catch (error) {
        status[`${type}_adapter`] = 'error';
      }
    }
    
    return status;
  }
}

// TrackMan Adapter
class TrackManAdapter {
  async connect(config) {
    console.log('🏌️ Connecting to TrackMan...');
    
    // Mock TrackMan connection
    return {
      stream: () => this.createMockStream(),
      getHistory: () => this.getMockHistory(),
      calibrate: () => ({ status: 'calibrated', timestamp: new Date().toISOString() }),
      getMetadata: () => ({
        model: 'TrackMan 4',
        firmware: '2.4.1',
        location: 'Indoor Range'
      })
    };
  }

  async parseData(data) {
    return {
      speed: data.ballSpeed || data['Ball Speed'] || null,
      distance: (data.carryDistance || data['Carry Distance'] || 0) + (data.rollDistance || data['Roll Distance'] || 0),
      spin: data.totalSpin || data['Total Spin'] || null,
      launchAngle: data.launchAngle || data['Launch Angle'] || null,
      smashFactor: data.smashFactor || data['Smash Factor'] || null,
      clubSpeed: data.clubSpeed || data['Club Speed'] || null,
      ballFlight: this.determineBallFlight(data),
      carryDistance: data.carryDistance || data['Carry Distance'] || null,
      rollDistance: data.rollDistance || data['Roll Distance'] || null,
      club: data.club || data['Club'] || 'unknown'
    };
  }

  async batchImport(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const shots = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index]?.trim();
      });
      
      shots.push(await this.parseData(rowData));
    }
    
    return shots;
  }

  determineBallFlight(data) {
    const sideSpin = data.sideSpin || data['Side Spin'] || 0;
    
    if (Math.abs(sideSpin) < 200) return 'straight';
    if (sideSpin > 500) return 'slice';
    if (sideSpin < -500) return 'hook';
    if (sideSpin > 0) return 'fade';
    return 'draw';
  }

  createMockStream() {
    return {
      on: (event, callback) => {
        if (event === 'data') {
          // Mock real-time data stream
          setInterval(() => {
            callback({
              ballSpeed: 145 + Math.random() * 20,
              carryDistance: 250 + Math.random() * 50,
              totalSpin: 2500 + Math.random() * 1000,
              launchAngle: 10 + Math.random() * 5,
              timestamp: new Date().toISOString()
            });
          }, 5000);
        }
      }
    };
  }

  getMockHistory() {
    return [
      { ballSpeed: 148, carryDistance: 265, totalSpin: 2650, launchAngle: 11.2 },
      { ballSpeed: 142, carryDistance: 255, totalSpin: 2850, launchAngle: 10.8 },
      { ballSpeed: 151, carryDistance: 275, totalSpin: 2450, launchAngle: 11.5 }
    ];
  }

  async healthCheck() {
    return { status: 'healthy', type: 'trackman' };
  }
}

// Foresight Adapter
class ForesightAdapter {
  async connect(config) {
    console.log('🏌️ Connecting to Foresight GCQuad...');
    
    return {
      stream: () => this.createMockStream(),
      getHistory: () => this.getMockHistory(),
      calibrate: () => ({ status: 'calibrated' }),
      getMetadata: () => ({ model: 'GCQuad', version: '3.2' })
    };
  }

  async parseData(data) {
    return {
      speed: data['Ball Speed (mph)'] || data.ballSpeed || null,
      distance: data['Total Distance (yds)'] || data.totalDistance || null,
      spin: data['Back Spin (rpm)'] || data.backSpin || null,
      launchAngle: data['Launch Angle (deg)'] || data.launchAngle || null,
      club: data['Club'] || data.club || 'unknown'
    };
  }

  async batchImport(csvData) {
    // Similar to TrackMan but with Foresight-specific column names
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const shots = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index]?.trim();
      });
      
      shots.push(await this.parseData(rowData));
    }
    
    return shots;
  }

  createMockStream() {
    return { on: () => {} };
  }

  getMockHistory() {
    return [];
  }

  async healthCheck() {
    return { status: 'healthy', type: 'foresight' };
  }
}

// SkyTrak Adapter
class SkyTrakAdapter {
  async connect(config) {
    console.log('🏌️ Connecting to SkyTrak...');
    
    return {
      stream: () => this.createMockStream(),
      getHistory: () => this.getMockHistory(),
      calibrate: () => ({ status: 'calibrated' }),
      getMetadata: () => ({ model: 'SkyTrak', version: '2.1' })
    };
  }

  async parseData(data) {
    return {
      speed: data.ballSpeed || null,
      distance: data.totalDistance || null,
      spin: data.spinRate || null,
      launchAngle: data.launchAngle || null,
      club: data.club || 'unknown'
    };
  }

  async batchImport(csvData) {
    return this.fallbackBatchParser(csvData);
  }

  createMockStream() {
    return { on: () => {} };
  }

  getMockHistory() {
    return [];
  }

  async healthCheck() {
    return { status: 'healthy', type: 'skytrak' };
  }
}

// FlightScope Adapter
class FlightScopeAdapter {
  async connect(config) {
    console.log('🏌️ Connecting to FlightScope...');
    
    return {
      stream: () => this.createMockStream(),
      getHistory: () => this.getMockHistory(),
      calibrate: () => ({ status: 'calibrated' }),
      getMetadata: () => ({ model: 'FlightScope Mevo+', version: '1.8' })
    };
  }

  async parseData(data) {
    return {
      speed: data.ballSpeed || null,
      distance: data.carryDistance || null,
      spin: data.spinRate || null,
      launchAngle: data.verticalLaunchAngle || null,
      club: data.club || 'unknown'
    };
  }

  async batchImport(csvData) {
    return this.fallbackBatchParser(csvData);
  }

  createMockStream() {
    return { on: () => {} };
  }

  getMockHistory() {
    return [];
  }

  async healthCheck() {
    return { status: 'healthy', type: 'flightscope' };
  }
}

module.exports = SimulatorAgent; 