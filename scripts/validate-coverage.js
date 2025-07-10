#!/usr/bin/env node

/**
 * Coverage Validation Script for GolfSimple
 * Ensures 100% mathematical precision in test coverage
 */

const fs = require('fs');
const path = require('path');

// Coverage thresholds - MUST BE 100%
const REQUIRED_COVERAGE = {
  branches: 100,
  functions: 100,
  lines: 100,
  statements: 100
};

// Critical files that MUST have 100% coverage
const CRITICAL_FILES = [
  'frontend/components/SmartProductCarousel.tsx',
  'backend/src/services/marketplaceAI.js',
  'backend/src/services/retailerLocationService.js',
  'backend/src/services/queueManager.js',
  'backend/src/services/claudeFlowAI.js',
  'backend/src/routes/marketplace.js'
];

// Mathematical precision requirements
const MATH_PRECISION_TESTS = [
  'distance calculation',
  'discount calculation',
  'performance match',
  'price comparison',
  'coordinate conversion',
  'percentage computation'
];

class CoverageValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.coverageData = null;
  }

  async validate() {
    console.log('🔍 Starting forensic coverage validation...\n');
    
    try {
      await this.loadCoverageData();
      await this.validateGlobalCoverage();
      await this.validateCriticalFiles();
      await this.validateMathematicalPrecision();
      await this.validateCodePaths();
      await this.generateReport();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Coverage validation failed:', error);
      return false;
    }
  }

  async loadCoverageData() {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    
    if (!fs.existsSync(coveragePath)) {
      throw new Error(`Coverage data not found at ${coveragePath}. Run 'npm run test:coverage' first.`);
    }

    try {
      const coverageJson = fs.readFileSync(coveragePath, 'utf8');
      this.coverageData = JSON.parse(coverageJson);
      console.log('✅ Coverage data loaded successfully');
    } catch (error) {
      throw new Error(`Failed to parse coverage data: ${error.message}`);
    }
  }

  async validateGlobalCoverage() {
    console.log('📊 Validating global coverage...');
    
    const total = this.coverageData.total;
    
    Object.entries(REQUIRED_COVERAGE).forEach(([metric, required]) => {
      const actual = total[metric].pct;
      
      if (actual < required) {
        this.errors.push({
          type: 'GLOBAL_COVERAGE',
          metric,
          required,
          actual,
          message: `Global ${metric} coverage is ${actual}%, required ${required}%`
        });
      } else {
        console.log(`  ✅ ${metric}: ${actual}% (required: ${required}%)`);
      }
    });

    // Validate no uncovered lines
    const uncoveredLines = total.lines.total - total.lines.covered;
    if (uncoveredLines > 0) {
      this.errors.push({
        type: 'UNCOVERED_LINES',
        count: uncoveredLines,
        message: `Found ${uncoveredLines} uncovered lines - ALL lines must be covered`
      });
    }

    // Validate no uncovered branches
    const uncoveredBranches = total.branches.total - total.branches.covered;
    if (uncoveredBranches > 0) {
      this.errors.push({
        type: 'UNCOVERED_BRANCHES',
        count: uncoveredBranches,
        message: `Found ${uncoveredBranches} uncovered branches - ALL branches must be covered`
      });
    }
  }

  async validateCriticalFiles() {
    console.log('🎯 Validating critical files coverage...');
    
    CRITICAL_FILES.forEach(filePath => {
      const fileData = this.findFileInCoverage(filePath);
      
      if (!fileData) {
        this.errors.push({
          type: 'MISSING_CRITICAL_FILE',
          file: filePath,
          message: `Critical file ${filePath} not found in coverage data`
        });
        return;
      }

      Object.entries(REQUIRED_COVERAGE).forEach(([metric, required]) => {
        const actual = fileData[metric].pct;
        
        if (actual < required) {
          this.errors.push({
            type: 'CRITICAL_FILE_COVERAGE',
            file: filePath,
            metric,
            required,
            actual,
            message: `Critical file ${filePath} has ${actual}% ${metric} coverage, required ${required}%`
          });
        } else {
          console.log(`  ✅ ${filePath} - ${metric}: ${actual}%`);
        }
      });
    });
  }

  async validateMathematicalPrecision() {
    console.log('🧮 Validating mathematical precision tests...');
    
    // Check if mathematical precision tests exist and pass
    const testResults = await this.loadTestResults();
    
    MATH_PRECISION_TESTS.forEach(testName => {
      const mathTests = testResults.filter(test => 
        test.title.toLowerCase().includes(testName.toLowerCase()) ||
        test.title.includes('Mathematical') ||
        test.title.includes('Precision')
      );

      if (mathTests.length === 0) {
        this.errors.push({
          type: 'MISSING_MATH_TEST',
          testName,
          message: `Missing mathematical precision test for: ${testName}`
        });
      } else {
        const failedTests = mathTests.filter(test => test.status !== 'passed');
        if (failedTests.length > 0) {
          this.errors.push({
            type: 'FAILED_MATH_TEST',
            testName,
            failedCount: failedTests.length,
            message: `${failedTests.length} mathematical precision tests failed for: ${testName}`
          });
        } else {
          console.log(`  ✅ ${testName}: All precision tests passed`);
        }
      }
    });
  }

  async validateCodePaths() {
    console.log('🛤️ Validating code path coverage...');
    
    // Validate that all code paths are tested
    Object.entries(this.coverageData).forEach(([filePath, fileData]) => {
      if (filePath === 'total') return;
      
      // Check for files with 100% line coverage but < 100% branch coverage
      if (fileData.lines.pct === 100 && fileData.branches.pct < 100) {
        this.warnings.push({
          type: 'INCOMPLETE_BRANCH_COVERAGE',
          file: filePath,
          branches: fileData.branches.pct,
          message: `File ${filePath} has 100% line coverage but only ${fileData.branches.pct}% branch coverage`
        });
      }

      // Check for files with very low function coverage
      if (fileData.functions.pct < 100) {
        const uncoveredFunctions = fileData.functions.total - fileData.functions.covered;
        this.errors.push({
          type: 'UNCOVERED_FUNCTIONS',
          file: filePath,
          count: uncoveredFunctions,
          percentage: fileData.functions.pct,
          message: `File ${filePath} has ${uncoveredFunctions} uncovered functions (${fileData.functions.pct}% coverage)`
        });
      }
    });
  }

  findFileInCoverage(searchPath) {
    // Find file in coverage data (handles different path formats)
    const normalized = searchPath.replace(/\\/g, '/');
    
    for (const [filePath, fileData] of Object.entries(this.coverageData)) {
      if (filePath === 'total') continue;
      
      const normalizedFilePath = filePath.replace(/\\/g, '/');
      if (normalizedFilePath.includes(normalized) || normalized.includes(normalizedFilePath)) {
        return fileData;
      }
    }
    
    return null;
  }

  async loadTestResults() {
    // Load Jest test results
    const jestResultsPath = path.join(process.cwd(), 'coverage', 'jest-results.json');
    
    if (fs.existsSync(jestResultsPath)) {
      try {
        const resultsJson = fs.readFileSync(jestResultsPath, 'utf8');
        const results = JSON.parse(resultsJson);
        
        return results.testResults?.flatMap(suite => 
          suite.assertionResults?.map(test => ({
            title: test.title,
            status: test.status,
            file: suite.name
          })) || []
        ) || [];
      } catch (error) {
        console.warn('⚠️ Could not load test results for precision validation');
        return [];
      }
    }
    
    return [];
  }

  async generateReport() {
    console.log('\n📋 COVERAGE VALIDATION REPORT');
    console.log('=' .repeat(50));
    
    if (this.errors.length === 0) {
      console.log('🎉 ALL COVERAGE REQUIREMENTS MET!');
      console.log('✅ 100% Code Coverage Achieved');
      console.log('✅ All Critical Files Covered');
      console.log('✅ Mathematical Precision Validated');
      console.log('✅ All Code Paths Tested');
    } else {
      console.log(`❌ COVERAGE VALIDATION FAILED - ${this.errors.length} errors found`);
      console.log('');
      
      // Group errors by type
      const errorsByType = this.groupBy(this.errors, 'type');
      
      Object.entries(errorsByType).forEach(([type, errors]) => {
        console.log(`${type} (${errors.length} errors):`);
        errors.forEach(error => {
          console.log(`  ❌ ${error.message}`);
        });
        console.log('');
      });
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️ WARNINGS - ${this.warnings.length} warnings found`);
      this.warnings.forEach(warning => {
        console.log(`  ⚠️ ${warning.message}`);
      });
      console.log('');
    }

    // Generate detailed HTML report
    await this.generateHtmlReport();
    
    console.log('📊 Detailed coverage report: ./coverage/lcov-report/index.html');
    console.log('📋 Validation report: ./coverage/validation-report.html');
  }

  async generateHtmlReport() {
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>GolfSimple Coverage Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #52B788, #2D6A4F); color: white; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric.error { background: #ffe6e6; border-left: 4px solid #dc3545; }
        .metric.success { background: #e6f7e6; border-left: 4px solid #28a745; }
        .errors { background: #fff5f5; border: 1px solid #dc3545; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .warnings { background: #fffacd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 GolfSimple Coverage Validation Report</h1>
        <p class="timestamp">Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="summary">
        ${Object.entries(REQUIRED_COVERAGE).map(([metric, required]) => {
          const actual = this.coverageData.total[metric].pct;
          const isSuccess = actual >= required;
          return `
            <div class="metric ${isSuccess ? 'success' : 'error'}">
                <h3>${metric.charAt(0).toUpperCase() + metric.slice(1)}</h3>
                <div style="font-size: 2em; font-weight: bold;">${actual}%</div>
                <div>Required: ${required}%</div>
            </div>
          `;
        }).join('')}
    </div>
    
    ${this.errors.length > 0 ? `
    <div class="errors">
        <h2>❌ Errors (${this.errors.length})</h2>
        ${this.errors.map(error => `<div>• ${error.message}</div>`).join('')}
    </div>
    ` : '<div style="background: #e6f7e6; padding: 20px; border-radius: 8px; text-align: center;"><h2>🎉 All Coverage Requirements Met!</h2></div>'}
    
    ${this.warnings.length > 0 ? `
    <div class="warnings">
        <h2>⚠️ Warnings (${this.warnings.length})</h2>
        ${this.warnings.map(warning => `<div>• ${warning.message}</div>`).join('')}
    </div>
    ` : ''}
    
    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3>📊 Coverage Standards</h3>
        <ul>
            <li><strong>Branches:</strong> 100% - Every conditional path must be tested</li>
            <li><strong>Functions:</strong> 100% - Every function must be called in tests</li>
            <li><strong>Lines:</strong> 100% - Every line of code must be executed</li>
            <li><strong>Statements:</strong> 100% - Every statement must be covered</li>
        </ul>
        
        <h3>🧮 Mathematical Precision Requirements</h3>
        <ul>
            <li>Distance calculations accurate to 0.1 yards</li>
            <li>Percentage calculations accurate to 0.01%</li>
            <li>Currency calculations accurate to 1 cent</li>
            <li>GPS coordinates accurate to 0.0001 degrees</li>
        </ul>
    </div>
</body>
</html>
    `;

    const reportPath = path.join(process.cwd(), 'coverage', 'validation-report.html');
    fs.writeFileSync(reportPath, reportHtml);
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new CoverageValidator();
  
  validator.validate().then(success => {
    if (success) {
      console.log('\n🎉 FORENSIC VALIDATION PASSED - 100% COVERAGE ACHIEVED');
      process.exit(0);
    } else {
      console.log('\n❌ FORENSIC VALIDATION FAILED - COVERAGE REQUIREMENTS NOT MET');
      process.exit(1);
    }
  }).catch(error => {
    console.error('\n💥 VALIDATION ERROR:', error);
    process.exit(1);
  });
}

module.exports = CoverageValidator;