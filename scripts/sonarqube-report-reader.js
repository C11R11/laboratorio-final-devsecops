#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Read and parse SonarQube reports
 * @param {string} reportsDir - Directory containing SonarQube reports
 */
function readSonarQubeReports(reportsDir) {
    try {
        // Check if directory exists
        if (!fs.existsSync(reportsDir)) {
            console.error(`❌ Reports directory not found: ${reportsDir}`);
            console.log('\n📋 Available options:');
            console.log('1. Download the artifact from GitHub Actions');
            console.log('2. Use a different path to an existing reports directory');
            console.log('3. Run the SAST workflow to generate new reports');
            return;
        }

        console.log('🔍 SonarQube Analysis Report');
        console.log('=' .repeat(50));

        // Read summary report if available
        const summaryPath = path.join(reportsDir, 'summary.md');
        if (fs.existsSync(summaryPath)) {
            const summary = fs.readFileSync(summaryPath, 'utf8');
            console.log('\n' + summary);
        }

        // Read and analyze detailed reports
        const issuesPath = path.join(reportsDir, 'issues-report.json');
        const measuresPath = path.join(reportsDir, 'measures-report.json');
        const hotspotsPath = path.join(reportsDir, 'hotspots-report.json');

        if (fs.existsSync(measuresPath)) {
            console.log('\n📊 Detailed Metrics Analysis:');
            console.log('-'.repeat(30));
            
            const measures = JSON.parse(fs.readFileSync(measuresPath, 'utf8'));
            const component = measures.component;
            
            if (component && component.measures) {
                const metrics = {};
                component.measures.forEach(measure => {
                    metrics[measure.metric] = measure.value;
                });

                // Display metrics with color coding
                const displayMetrics = [
                    { key: 'bugs', label: 'Bugs', emoji: '🐛' },
                    { key: 'vulnerabilities', label: 'Vulnerabilities', emoji: '🔒' },
                    { key: 'code_smells', label: 'Code Smells', emoji: '👃' },
                    { key: 'security_hotspots', label: 'Security Hotspots', emoji: '🔥' },
                    { key: 'coverage', label: 'Code Coverage', emoji: '📈' },
                    { key: 'duplicated_lines_density', label: 'Duplication', emoji: '📋' },
                    { key: 'maintainability_rating', label: 'Maintainability', emoji: '🔧' },
                    { key: 'reliability_rating', label: 'Reliability', emoji: '⚡' },
                    { key: 'security_rating', label: 'Security Rating', emoji: '🛡️' }
                ];

                displayMetrics.forEach(metric => {
                    const value = metrics[metric.key] || 'N/A';
                    let color = '⚪';
                    
                    if (metric.key === 'coverage') {
                        const coverage = parseFloat(value);
                        if (coverage >= 80) color = '🟢';
                        else if (coverage >= 60) color = '🟡';
                        else color = '🔴';
                    } else if (metric.key.includes('rating')) {
                        const rating = parseFloat(value);
                        if (rating >= 4) color = '🟢';
                        else if (rating >= 2) color = '🟡';
                        else color = '🔴';
                    } else {
                        const count = parseFloat(value);
                        if (count === 0) color = '🟢';
                        else if (count <= 5) color = '🟡';
                        else color = '🔴';
                    }
                    
                    console.log(`${color} ${metric.emoji} ${metric.label}: ${value}`);
                });
            }
        }

        if (fs.existsSync(issuesPath)) {
            console.log('\n🚨 Issues Analysis:');
            console.log('-'.repeat(20));
            
            const issues = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
            
            if (issues.issues && issues.issues.length > 0) {
                const severityCounts = {
                    'BLOCKER': 0,
                    'CRITICAL': 0,
                    'MAJOR': 0,
                    'MINOR': 0,
                    'INFO': 0
                };

                const typeCounts = {
                    'VULNERABILITY': 0,
                    'BUG': 0,
                    'CODE_SMELL': 0
                };

                issues.issues.forEach(issue => {
                    severityCounts[issue.severity]++;
                    typeCounts[issue.type]++;
                });

                console.log('📈 Issues by Severity:');
                Object.entries(severityCounts).forEach(([severity, count]) => {
                    const emoji = severity === 'BLOCKER' ? '🔴' : 
                                severity === 'CRITICAL' ? '🟠' : 
                                severity === 'MAJOR' ? '🟡' : 
                                severity === 'MINOR' ? '🟢' : '🔵';
                    console.log(`  ${emoji} ${severity}: ${count}`);
                });

                console.log('\n📊 Issues by Type:');
                Object.entries(typeCounts).forEach(([type, count]) => {
                    const emoji = type === 'VULNERABILITY' ? '🔒' : 
                                type === 'BUG' ? '🐛' : '👃';
                    console.log(`  ${emoji} ${type}: ${count}`);
                });

                // Show top 5 most critical issues
                const criticalIssues = issues.issues
                    .filter(issue => issue.severity === 'BLOCKER' || issue.severity === 'CRITICAL')
                    .slice(0, 5);

                if (criticalIssues.length > 0) {
                    console.log('\n🚨 Top Critical Issues:');
                    criticalIssues.forEach((issue, index) => {
                        const severityEmoji = issue.severity === 'BLOCKER' ? '🔴' : '🟠';
                        console.log(`\n${index + 1}. ${severityEmoji} ${issue.severity}: ${issue.message}`);
                        console.log(`   File: ${issue.component}`);
                        console.log(`   Line: ${issue.line || 'N/A'}`);
                        console.log(`   Type: ${issue.type}`);
                    });
                }
            } else {
                console.log('✅ No issues found!');
            }
        }

        if (fs.existsSync(hotspotsPath)) {
            console.log('\n🔥 Security Hotspots Analysis:');
            console.log('-'.repeat(30));
            
            const hotspots = JSON.parse(fs.readFileSync(hotspotsPath, 'utf8'));
            
            if (hotspots.hotspots && hotspots.hotspots.length > 0) {
                const statusCounts = {
                    'TO_REVIEW': 0,
                    'REVIEWED': 0,
                    'SAFE': 0
                };

                const securityCategoryCounts = {};

                hotspots.hotspots.forEach(hotspot => {
                    statusCounts[hotspot.status]++;
                    const category = hotspot.securityCategory || 'UNKNOWN';
                    securityCategoryCounts[category] = (securityCategoryCounts[category] || 0) + 1;
                });

                console.log('📊 Hotspots by Status:');
                Object.entries(statusCounts).forEach(([status, count]) => {
                    const emoji = status === 'TO_REVIEW' ? '🟡' : 
                                status === 'REVIEWED' ? '🟢' : '🔵';
                    console.log(`  ${emoji} ${status}: ${count}`);
                });

                console.log('\n🔒 Hotspots by Security Category:');
                Object.entries(securityCategoryCounts).forEach(([category, count]) => {
                    console.log(`  🔐 ${category}: ${count}`);
                });

                // Show hotspots that need review
                const toReview = hotspots.hotspots.filter(h => h.status === 'TO_REVIEW');
                if (toReview.length > 0) {
                    console.log('\n⚠️  Hotspots Requiring Review:');
                    toReview.slice(0, 3).forEach((hotspot, index) => {
                        console.log(`\n${index + 1}. ${hotspot.message}`);
                        console.log(`   File: ${hotspot.component}`);
                        console.log(`   Line: ${hotspot.line || 'N/A'}`);
                        console.log(`   Category: ${hotspot.securityCategory}`);
                    });
                }
            } else {
                console.log('✅ No security hotspots found!');
            }
        }

        // Generate recommendations
        console.log('\n💡 Recommendations:');
        console.log('-'.repeat(20));
        
        if (fs.existsSync(measuresPath)) {
            const measures = JSON.parse(fs.readFileSync(measuresPath, 'utf8'));
            const component = measures.component;
            
            if (component && component.measures) {
                const metrics = {};
                component.measures.forEach(measure => {
                    metrics[measure.metric] = parseFloat(measure.value) || 0;
                });

                if (metrics.vulnerabilities > 0) {
                    console.log('• 🔒 Address security vulnerabilities immediately');
                }
                if (metrics.bugs > 0) {
                    console.log('• 🐛 Fix bugs to improve reliability');
                }
                if (metrics.code_smells > 10) {
                    console.log('• 👃 Refactor code to reduce code smells');
                }
                if (metrics.coverage < 80) {
                    console.log('• 📈 Increase test coverage to at least 80%');
                }
                if (metrics.duplicated_lines_density > 3) {
                    console.log('• 📋 Reduce code duplication');
                }
            }
        }

        console.log('• 🔄 Run regular security scans');
        console.log('• 📚 Review and update dependencies regularly');
        console.log('• 🛡️ Follow secure coding practices');

    } catch (error) {
        console.error('❌ Error reading SonarQube reports:', error.message);
        if (error instanceof SyntaxError) {
            console.log('One or more report files appear to be invalid JSON.');
        }
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    let reportsDir = 'sonarqube-reports'; // Default path

    // Parse command line arguments
    if (args.length > 0) {
        if (args[0] === '--help' || args[0] === '-h') {
            console.log('🔍 SonarQube Report Reader');
            console.log('Usage: node sonarqube-report-reader.js [options] [reports-directory]');
            console.log('\nOptions:');
            console.log('  --help, -h     Show this help message');
            console.log('  --summary, -s  Show only summary');
            console.log('\nExamples:');
            console.log('  node sonarqube-report-reader.js');
            console.log('  node sonarqube-report-reader.js sonarqube-reports');
            console.log('  node sonarqube-report-reader.js ./artifacts/sonarqube-analysis-reports');
            return;
        }
        reportsDir = args[0];
    }

    // Resolve relative path
    if (!path.isAbsolute(reportsDir)) {
        reportsDir = path.resolve(process.cwd(), reportsDir);
    }

    readSonarQubeReports(reportsDir);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { readSonarQubeReports }; 