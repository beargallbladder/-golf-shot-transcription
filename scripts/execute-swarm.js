#!/usr/bin/env node

const ImplementationController = require('../backend/src/agents/ImplementationController');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');

console.log(chalk.blue.bold(`
🎯 GolfSimple Swarm Implementation System
========================================
`));

async function main() {
  const controller = new ImplementationController();
  
  const { mode } = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Select execution mode:',
    choices: [
      { title: '🚀 Week 1: Critical Performance & Foundation', value: 'week1' },
      { title: '📱 Week 2: Mobile-First UI Foundation', value: 'week2' },
      { title: '🎮 Week 3-4: Engagement & Gamification', value: 'week34' },
      { title: '🏪 Week 5-6: Retailer Platform & SEO', value: 'week56' },
      { title: '⚡ Week 7-8: Scale & Polish', value: 'week78' },
      { title: '🔥 Execute Full Roadmap (8 weeks)', value: 'full' },
      { title: '🎯 Execute Specific Tasks', value: 'specific' },
      { title: '📊 Generate Progress Report', value: 'report' }
    ]
  });

  try {
    switch (mode) {
      case 'week1':
        await executeWeek(controller, 1, 'Critical Performance & Foundation');
        break;
        
      case 'week2':
        await executeWeek(controller, 2, 'Mobile-First UI Foundation');
        break;
        
      case 'week34':
        await executeWeeks(controller, [3, 4], 'Engagement & Gamification');
        break;
        
      case 'week56':
        await executeWeeks(controller, [5, 6], 'Retailer Platform & SEO');
        break;
        
      case 'week78':
        await executeWeeks(controller, [7, 8], 'Scale & Polish');
        break;
        
      case 'full':
        await executeFullRoadmap(controller);
        break;
        
      case 'specific':
        await executeSpecificTasks(controller);
        break;
        
      case 'report':
        await generateReport(controller);
        break;
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Execution failed:'), error);
  } finally {
    await controller.shutdown();
  }
}

async function executeWeek(controller, week, description) {
  console.log(chalk.green.bold(`\n🚀 Executing Week ${week}: ${description}\n`));
  
  const spinner = ora('Loading roadmap...').start();
  await controller.loadRoadmap();
  spinner.succeed('Roadmap loaded');
  
  spinner.start(`Executing Week ${week} tasks...`);
  const result = await controller.executeWeek(week);
  spinner.succeed(`Week ${week} completed!`);
  
  displayResults(result);
}

async function executeWeeks(controller, weeks, description) {
  console.log(chalk.green.bold(`\n🚀 Executing Weeks ${weeks.join('-')}: ${description}\n`));
  
  const spinner = ora('Loading roadmap...').start();
  await controller.loadRoadmap();
  spinner.succeed('Roadmap loaded');
  
  for (const week of weeks) {
    spinner.start(`Executing Week ${week} tasks...`);
    const result = await controller.executeWeek(week);
    spinner.succeed(`Week ${week} completed!`);
    displayResults(result);
  }
}

async function executeFullRoadmap(controller) {
  console.log(chalk.green.bold('\n🔥 Executing Full 8-Week Roadmap\n'));
  
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: 'This will execute all 8 weeks of tasks. Continue?',
    initial: false
  });
  
  if (!confirm) {
    console.log(chalk.yellow('Execution cancelled'));
    return;
  }
  
  const spinner = ora('Loading roadmap...').start();
  await controller.loadRoadmap();
  spinner.succeed('Roadmap loaded');
  
  spinner.start('Executing full roadmap...');
  const result = await controller.executeFullRoadmap();
  spinner.succeed('Full roadmap execution complete!');
  
  console.log(chalk.green.bold('\n✅ Implementation Complete!'));
  console.log(`Total tasks: ${result.totalTasks}`);
  console.log(`Completed: ${result.completed}`);
}

async function executeSpecificTasks(controller) {
  const spinner = ora('Loading roadmap...').start();
  await controller.loadRoadmap();
  spinner.succeed('Roadmap loaded');
  
  // Show available tasks
  const tasks = controller.roadmap.map(task => ({
    title: `${task.id}: ${task.description.substring(0, 60)}...`,
    value: task.id
  }));
  
  const { selectedTasks } = await prompts({
    type: 'multiselect',
    name: 'selectedTasks',
    message: 'Select tasks to execute:',
    choices: tasks,
    hint: '- Space to select. Return to submit'
  });
  
  if (selectedTasks.length === 0) {
    console.log(chalk.yellow('No tasks selected'));
    return;
  }
  
  spinner.start(`Executing ${selectedTasks.length} tasks...`);
  const result = await controller.executeSpecificTasks(selectedTasks);
  spinner.succeed('Tasks completed!');
  
  displayResults(result);
}

async function generateReport(controller) {
  const spinner = ora('Generating progress report...').start();
  
  await controller.loadRoadmap();
  const report = await controller.generateReport();
  
  spinner.succeed('Report generated successfully!');
  
  console.log(chalk.green('\n📊 Progress report saved to: IMPLEMENTATION_PROGRESS_REPORT.md'));
  console.log(chalk.dim('\nReport preview:'));
  console.log(report.substring(0, 500) + '...\n');
}

function displayResults(result) {
  console.log(chalk.blue('\n📊 Execution Results:'));
  
  if (result.critical) {
    console.log(chalk.red(`\nCritical Tasks: ${result.critical.successRate} success rate`));
    if (result.critical.errors.length > 0) {
      console.log(chalk.red('Errors:'));
      result.critical.errors.forEach(e => console.log(`  - ${e.task}: ${e.error}`));
    }
  }
  
  if (result.high) {
    console.log(chalk.yellow(`\nHigh Priority Tasks: ${result.high.successRate} success rate`));
  }
  
  if (result.normal) {
    console.log(chalk.green(`\nNormal Tasks: ${result.normal.successRate} success rate`));
  }
  
  console.log(chalk.dim(`\nTimestamp: ${result.timestamp || new Date().toISOString()}`));
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\nGracefully shutting down...'));
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});