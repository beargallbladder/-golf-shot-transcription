const SwarmOrchestrator = require('./SwarmOrchestrator');
const fs = require('fs').promises;
const path = require('path');

/**
 * ImplementationController - Main controller for executing the roadmap
 */
class ImplementationController {
  constructor() {
    this.swarm = new SwarmOrchestrator();
    this.roadmap = null;
    this.progress = new Map();
  }

  async loadRoadmap() {
    const roadmapPath = path.join(__dirname, '../../../GOLFSIMPLE_IMPLEMENTATION_ROADMAP.md');
    const content = await fs.readFile(roadmapPath, 'utf8');
    this.roadmap = this.parseRoadmap(content);
    return this.roadmap;
  }

  parseRoadmap(content) {
    // Parse the markdown roadmap into executable tasks
    const tasks = [];
    const lines = content.split('\n');
    
    let currentWeek = null;
    let currentCategory = null;
    
    for (const line of lines) {
      if (line.includes('Week') && line.includes(':')) {
        const weekMatch = line.match(/Week (\d+)/);
        if (weekMatch) {
          currentWeek = parseInt(weekMatch[1]);
        }
      }
      
      if (line.includes('- [ ]')) {
        const task = {
          id: `task-${tasks.length + 1}`,
          description: line.replace('- [ ]', '').trim(),
          week: currentWeek,
          category: this.categorizeTask(line),
          priority: this.prioritizeTask(line),
          status: 'pending'
        };
        
        // Extract specific task types
        if (line.includes('Remove defunct')) {
          task.type = 'performance';
          task.subtype = 'remove-defunct-api';
        } else if (line.includes('Implement true Web Speech')) {
          task.type = 'performance';
          task.subtype = 'web-speech-api';
        } else if (line.includes('Redis')) {
          task.type = 'performance';
          task.subtype = 'implement-caching';
          task.target = 'redis';
        } else if (line.includes('database indexes')) {
          task.type = 'performance';
          task.subtype = 'optimize-queries';
        } else if (line.includes('JWT refresh')) {
          task.type = 'security';
          task.subtype = 'jwt-refresh';
        } else if (line.includes('bottom tab navigation')) {
          task.type = 'ui';
          task.subtype = 'mobile-navigation';
        } else if (line.includes('haptic feedback')) {
          task.type = 'ui';
          task.subtype = 'haptic-system';
        } else if (line.includes('leaderboard')) {
          task.type = 'ui';
          task.subtype = 'leaderboard';
        } else if (line.includes('My Bag')) {
          task.type = 'ui';
          task.subtype = 'my-bag';
        } else if (line.includes('retailer activation')) {
          task.type = 'retailer';
          task.subtype = 'activation-system';
        } else if (line.includes('SEO') || line.includes('sitemap')) {
          task.type = 'seo';
          task.subtype = line.includes('sitemap') ? 'sitemap' : 'meta-tags';
        }
        
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  categorizeTask(description) {
    if (description.includes('performance') || description.includes('Redis') || description.includes('cache')) {
      return 'performance';
    } else if (description.includes('mobile') || description.includes('navigation') || description.includes('UI')) {
      return 'ui';
    } else if (description.includes('security') || description.includes('JWT') || description.includes('SSL')) {
      return 'security';
    } else if (description.includes('SEO') || description.includes('sitemap')) {
      return 'seo';
    } else if (description.includes('retailer')) {
      return 'retailer';
    }
    return 'general';
  }

  prioritizeTask(description) {
    if (description.includes('Critical') || description.includes('security') || description.includes('performance')) {
      return 'critical';
    } else if (description.includes('mobile') || description.includes('UI')) {
      return 'high';
    } else if (description.includes('SEO')) {
      return 'medium';
    }
    return 'normal';
  }

  async executeWeek(weekNumber) {
    console.log(`\n🚀 Executing Week ${weekNumber} tasks...\n`);
    
    const weekTasks = this.roadmap.filter(task => task.week === weekNumber);
    console.log(`Found ${weekTasks.length} tasks for Week ${weekNumber}`);
    
    // Group tasks by priority for swarm execution
    const criticalTasks = weekTasks.filter(t => t.priority === 'critical');
    const highPriorityTasks = weekTasks.filter(t => t.priority === 'high');
    const normalTasks = weekTasks.filter(t => t.priority === 'normal' || t.priority === 'medium');
    
    // Execute in priority order with parallelization
    const results = {
      week: weekNumber,
      critical: await this.swarm.executeRoadmap(criticalTasks),
      high: await this.swarm.executeRoadmap(highPriorityTasks),
      normal: await this.swarm.executeRoadmap(normalTasks)
    };
    
    // Update progress
    weekTasks.forEach(task => {
      this.progress.set(task.id, {
        ...task,
        status: 'completed',
        completedAt: new Date()
      });
    });
    
    return results;
  }

  async executeFullRoadmap() {
    console.log('🎯 Starting full roadmap execution...\n');
    
    await this.loadRoadmap();
    const results = [];
    
    // Execute weeks 1-8
    for (let week = 1; week <= 8; week++) {
      const weekResult = await this.executeWeek(week);
      results.push(weekResult);
      
      // Save progress after each week
      await this.saveProgress();
      
      console.log(`\n✅ Week ${week} completed!`);
      console.log(`Success rate: ${weekResult.critical.successRate}`);
    }
    
    return {
      totalTasks: this.roadmap.length,
      completed: this.progress.size,
      results
    };
  }

  async executeSpecificTasks(taskIds) {
    console.log(`🎯 Executing specific tasks: ${taskIds.join(', ')}`);
    
    const tasks = this.roadmap.filter(task => taskIds.includes(task.id));
    const results = await this.swarm.executeRoadmap(tasks);
    
    // Update progress
    tasks.forEach(task => {
      this.progress.set(task.id, {
        ...task,
        status: 'completed',
        completedAt: new Date()
      });
    });
    
    return results;
  }

  async saveProgress() {
    const progressData = {
      timestamp: new Date(),
      totalTasks: this.roadmap.length,
      completed: this.progress.size,
      tasks: Array.from(this.progress.values())
    };
    
    const progressPath = path.join(__dirname, '../../../implementation-progress.json');
    await fs.writeFile(progressPath, JSON.stringify(progressData, null, 2));
  }

  async generateReport() {
    const completed = Array.from(this.progress.values()).filter(t => t.status === 'completed');
    const pending = this.roadmap.filter(t => !this.progress.has(t.id));
    
    const report = `# GolfSimple Implementation Progress Report

Generated: ${new Date().toISOString()}

## Summary
- Total Tasks: ${this.roadmap.length}
- Completed: ${completed.length} (${(completed.length / this.roadmap.length * 100).toFixed(1)}%)
- Pending: ${pending.length}

## Completed Tasks by Category
${this.generateCategoryReport(completed)}

## Pending Tasks by Week
${this.generatePendingReport(pending)}

## Performance Metrics
${await this.generatePerformanceMetrics()}

## Next Steps
${this.generateNextSteps(pending)}
`;

    const reportPath = path.join(__dirname, '../../../IMPLEMENTATION_PROGRESS_REPORT.md');
    await fs.writeFile(reportPath, report);
    
    return report;
  }

  generateCategoryReport(tasks) {
    const categories = {};
    tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = [];
      }
      categories[task.category].push(task);
    });
    
    return Object.entries(categories)
      .map(([category, tasks]) => `### ${category} (${tasks.length} tasks)
${tasks.map(t => `- ✅ ${t.description}`).join('\n')}`)
      .join('\n\n');
  }

  generatePendingReport(tasks) {
    const byWeek = {};
    tasks.forEach(task => {
      if (!byWeek[task.week]) {
        byWeek[task.week] = [];
      }
      byWeek[task.week].push(task);
    });
    
    return Object.entries(byWeek)
      .map(([week, tasks]) => `### Week ${week} (${tasks.length} tasks)
${tasks.map(t => `- [ ] ${t.description}`).join('\n')}`)
      .join('\n\n');
  }

  async generatePerformanceMetrics() {
    // Get metrics from the swarm
    const metrics = await this.swarm.agents.monitoring?.getMetrics() || {};
    
    return `- Average Task Completion Time: ${metrics.avgCompletionTime || 'N/A'}
- Success Rate: ${metrics.successRate || 'N/A'}
- Performance Improvements: ${metrics.performanceGains || 'N/A'}
- Error Rate: ${metrics.errorRate || '0%'}`;
  }

  generateNextSteps(pending) {
    const nextWeek = Math.min(...pending.map(t => t.week).filter(w => w));
    const nextTasks = pending.filter(t => t.week === nextWeek).slice(0, 5);
    
    return `1. Complete Week ${nextWeek} tasks (${pending.filter(t => t.week === nextWeek).length} remaining)
2. Priority tasks:
${nextTasks.map(t => `   - ${t.description}`).join('\n')}
3. Estimated completion: ${this.estimateCompletion(pending)}`;
  }

  estimateCompletion(pending) {
    const weeksRemaining = new Set(pending.map(t => t.week)).size;
    const date = new Date();
    date.setDate(date.getDate() + weeksRemaining * 7);
    return date.toLocaleDateString();
  }

  async shutdown() {
    await this.saveProgress();
    await this.swarm.shutdown();
  }
}

// CLI Interface
if (require.main === module) {
  const controller = new ImplementationController();
  
  const command = process.argv[2];
  
  async function run() {
    try {
      switch (command) {
        case 'week':
          const week = parseInt(process.argv[3]);
          const result = await controller.executeWeek(week);
          console.log('\nResults:', JSON.stringify(result, null, 2));
          break;
          
        case 'full':
          const fullResult = await controller.executeFullRoadmap();
          console.log('\nFull execution complete:', fullResult);
          break;
          
        case 'tasks':
          const taskIds = process.argv.slice(3);
          const taskResult = await controller.executeSpecificTasks(taskIds);
          console.log('\nTask results:', taskResult);
          break;
          
        case 'report':
          const report = await controller.generateReport();
          console.log('\nReport generated successfully');
          break;
          
        default:
          console.log(`
Usage:
  node ImplementationController.js week <number>  - Execute specific week
  node ImplementationController.js full           - Execute full roadmap
  node ImplementationController.js tasks <ids>    - Execute specific tasks
  node ImplementationController.js report         - Generate progress report
          `);
      }
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      await controller.shutdown();
      process.exit(0);
    }
  }
  
  run();
}

module.exports = ImplementationController;