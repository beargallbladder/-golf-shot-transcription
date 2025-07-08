/**
 * Golf Swarm Agent Orchestrator
 * Coordinates all 9 specialized AI agents for intelligent golf shot analysis
 * Based on GOLF_SWARM_PRD_13_10.md specification
 */

const MediaIngestAgent = require('./MediaIngestAgent');
const TranscriptionAgent = require('./TranscriptionAgent');
const ShotNormalizerAgent = require('./ShotNormalizerAgent');
const ScoringAgent = require('./ScoringAgent');
const BagComparisonAgent = require('./BagComparisonAgent');
const GuardrailAgent = require('./GuardrailAgent');
const UXAgent = require('./UXAgent');
const FeedAgent = require('./FeedAgent');
const SimulatorAgent = require('./SimulatorAgent');

class AgentOrchestrator {
  constructor() {
    this.agents = {
      mediaIngest: new MediaIngestAgent(),
      transcription: new TranscriptionAgent(),
      normalizer: new ShotNormalizerAgent(),
      scoring: new ScoringAgent(),
      bagComparison: new BagComparisonAgent(),
      guardrail: new GuardrailAgent(),
      ux: new UXAgent(),
      feed: new FeedAgent(),
      simulator: new SimulatorAgent()
    };
  }

  /**
   * Main processing pipeline for shot uploads
   * Orchestrates all agents in optimal sequence with parallel processing
   */
  async processShotUpload(input, user, context = {}) {
    try {
      console.log('🚀 Starting swarm processing for shot upload');
      
      // Phase 1: Media ingestion and transcription
      const mediaData = await this.agents.mediaIngest.ingest(input, context);
      console.log('📱 Media ingestion complete');
      
      const transcription = await this.agents.transcription.transcribe(mediaData, {
        ...context,
        user,
        simulatorType: mediaData.simulatorType
      });
      console.log('🧠 AI transcription complete');
      
      // Phase 2: Data normalization
      const normalizedShot = await this.agents.normalizer.normalize(transcription, context);
      console.log('⚙️ Shot normalization complete');
      
      // Phase 3: Parallel processing with error isolation
      const results = await Promise.allSettled([
        this.agents.scoring.score(normalizedShot, user),
        this.agents.bagComparison.analyzeBag([normalizedShot], user),
        this.agents.guardrail.validate(normalizedShot, { user, context })
      ]);
      
      // Extract results and handle individual failures
      const scoring = results[0].status === 'fulfilled' ? results[0].value : this.getDefaultScoring();
      const bagAnalysis = results[1].status === 'fulfilled' ? results[1].value : this.getDefaultBagAnalysis();
      const validation = results[2].status === 'fulfilled' ? results[2].value : this.getDefaultValidation();
      
      // Log any agent failures
      results.forEach((result, index) => {
        const agentNames = ['scoring', 'bagComparison', 'guardrail'];
        if (result.status === 'rejected') {
          console.error(`❌ ${agentNames[index]} agent failed:`, result.reason);
        }
      });
      
      console.log('📊 Parallel analysis complete');
      
      // Phase 4: Validation check
      if (!validation.isValid) {
        console.log('⚠️ Validation failed:', validation.flags);
        return this.handleValidationFailure(validation);
      }
      
      // Phase 5: Generate optimized response
      const response = await this.agents.ux.optimizeResponse({
        shot: normalizedShot,
        scoring,
        bagAnalysis,
        validation,
        user,
        context
      });
      
      // Phase 6: Update feed (async)
      this.agents.feed.updateFeed(user, normalizedShot, scoring).catch(console.error);
      
      console.log('✅ Swarm processing complete');
      return response;
      
    } catch (error) {
      console.error('❌ Agent orchestration error:', error);
      return this.handleProcessingError(error, input, user, context);
    }
  }

  /**
   * Handle validation failures with user-friendly responses
   */
  async handleValidationFailure(validation) {
    return {
      success: false,
      error: 'Shot validation failed',
      details: validation.flags,
      suggestions: validation.suggestions,
      confidence: validation.confidence
    };
  }

  /**
   * Handle processing errors gracefully
   */
  async handleProcessingError(error, input, user, context) {
    console.error('Processing error details:', {
      error: error.message,
      stack: error.stack,
      input: typeof input,
      userId: user?.id,
      context
    });

    return {
      success: false,
      error: 'Processing failed',
      message: 'Unable to analyze shot. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Process simulator data directly (for real-time connections)
   */
  async processSimulatorData(simulatorType, data, user, context = {}) {
    try {
      console.log(`🏌️ Processing ${simulatorType} data`);
      
      // Connect to simulator agent
      const simulatorData = await this.agents.simulator.parseSimulatorData(simulatorType, data);
      
      // Process through normal pipeline
      return await this.processShotUpload(simulatorData, user, {
        ...context,
        simulatorType,
        isRealTime: true
      });
      
    } catch (error) {
      console.error('Simulator processing error:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple shots (for CSV imports, etc.)
   */
  async processBatchShots(shots, user, context = {}) {
    try {
      console.log(`🔄 Processing batch of ${shots.length} shots`);
      
      const results = [];
      for (const shot of shots) {
        const result = await this.processShotUpload(shot, user, {
          ...context,
          isBatch: true
        });
        results.push(result);
      }
      
      // Generate batch summary
      const batchAnalysis = await this.agents.bagComparison.analyzeBag(
        results.filter(r => r.success).map(r => r.shot),
        user
      );
      
      return {
        success: true,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
        batchAnalysis
      };
      
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  }

  /**
   * Get default scoring when scoring agent fails
   */
  getDefaultScoring() {
    return {
      personalBest: false,
      score: 0,
      improvements: [],
      confidence: 0.1
    };
  }

  /**
   * Get default bag analysis when bag comparison agent fails
   */
  getDefaultBagAnalysis() {
    return {
      comparison: [],
      recommendations: [],
      confidence: 0.1
    };
  }

  /**
   * Get default validation when guardrail agent fails
   */
  getDefaultValidation() {
    return {
      isValid: true, // Fail open for safety
      flags: [],
      confidence: 0.1,
      fallback: true
    };
  }

  /**
   * Get agent health status
   */
  async getAgentStatus() {
    const status = {};
    
    for (const [name, agent] of Object.entries(this.agents)) {
      try {
        status[name] = await agent.healthCheck?.() || { status: 'unknown' };
      } catch (error) {
        status[name] = { status: 'error', error: error.message };
      }
    }
    
    return status;
  }
}

module.exports = AgentOrchestrator; 