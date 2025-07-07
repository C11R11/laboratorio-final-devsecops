#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test the SonarQube workflow with sample data
 */
function testSonarQubeWorkflow() {
    console.log('🧪 Testing SonarQube Workflow Modifications');
    console.log('=' .repeat(50));

    // Create test directory
    const testDir = 'test-sonarqube-reports';
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }

    // Create sample measures report
    const sampleMeasures = {
        component: {
            measures: [
                { metric: 'bugs', value: '2' },
                { metric: 'vulnerabilities', value: '1' },
                { metric: 'code_smells', value: '15' },
                { metric: 'security_hotspots', value: '3' },
                { metric: 'coverage', value: '75.5' },
                { metric: 'duplicated_lines_density', value: '2.1' },
                { metric: 'maintainability_rating', value: '3' },
                { metric: 'reliability_rating', value: '4' },
                { metric: 'security_rating', value: '2' }
            ]
        }
    };

    // Create sample issues report
    const sampleIssues = {
        issues: [
            {
                severity: 'BLOCKER',
                type: 'VULNERABILITY',
                message: 'SQL injection vulnerability',
                component: 'src/api/users.ts',
                line: 45
            },
            {
                severity: 'CRITICAL',
                type: 'BUG',
                message: 'Potential null pointer dereference',
                component: 'src/utils/validator.ts',
                line: 23
            },
            {
                severity: 'MAJOR',
                type: 'CODE_SMELL',
                message: 'Function has too many parameters',
                component: 'src/components/UserProfile.tsx',
                line: 67
            }
        ]
    };

    // Create sample hotspots report
    const sampleHotspots = {
        hotspots: [
            {
                status: 'TO_REVIEW',
                securityCategory: 'SQL_INJECTION',
                message: 'Potential SQL injection in user input',
                component: 'src/api/users.ts',
                line: 45
            },
            {
                status: 'REVIEWED',
                securityCategory: 'XSS',
                message: 'Cross-site scripting vulnerability',
                component: 'src/components/Comment.tsx',
                line: 89
            }
        ]
    };

    // Write sample files
    fs.writeFileSync(path.join(testDir, 'measures-report.json'), JSON.stringify(sampleMeasures, null, 2));
    fs.writeFileSync(path.join(testDir, 'issues-report.json'), JSON.stringify(sampleIssues, null, 2));
    fs.writeFileSync(path.join(testDir, 'hotspots-report.json'), JSON.stringify(sampleHotspots, null, 2));

    // Create sample summary
    const summary = `# SonarQube Analysis Report
Generated on: ${new Date().toISOString()}
Branch: main
Project: C11R11_laboratorio-final-devsecops

## Key Metrics

- **Bugs**: 2
- **Vulnerabilities**: 1
- **Code Smells**: 15
- **Security Hotspots**: 3
- **Code Coverage**: 75.5%

## Critical Issues

- BLOCKER: SQL injection vulnerability (Line 45)
- CRITICAL: Potential null pointer dereference (Line 23)

## Report Files

- issues-report.json: Detailed list of all issues
- hotspots-report.json: Security hotspots analysis
- measures-report.json: Project metrics and measures
- summary.md: This summary report`;

    fs.writeFileSync(path.join(testDir, 'summary.md'), summary);

    console.log('✅ Sample reports created successfully');
    console.log(`📁 Test directory: ${testDir}`);
    console.log('\n📋 Files created:');
    console.log('- measures-report.json');
    console.log('- issues-report.json');
    console.log('- hotspots-report.json');
    console.log('- summary.md');

    console.log('\n🧪 Now testing the report reader...');
    console.log('-'.repeat(30));

    // Test the report reader
    try {
        const { readSonarQubeReports } = require('./sonarqube-report-reader.js');
        readSonarQubeReports(testDir);
    } catch (error) {
        console.error('❌ Error testing report reader:', error.message);
    }

    console.log('\n✅ Test completed!');
    console.log('\n💡 To clean up test files, run:');
    console.log(`rm -rf ${testDir}`);
}

// Run the test
if (require.main === module) {
    testSonarQubeWorkflow();
}

module.exports = { testSonarQubeWorkflow }; 