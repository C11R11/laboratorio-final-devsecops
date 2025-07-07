#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Read and parse Trivy SARIF report
 * @param {string} reportPath - Path to the SARIF report file
 */
function readTrivyReport(reportPath) {
    try {
        // Check if file exists
        if (!fs.existsSync(reportPath)) {
            console.error(`❌ Report file not found: ${reportPath}`);
            console.log('\n📋 Available options:');
            console.log('1. Run the container scan workflow to generate a new report');
            console.log('2. Download the artifact from GitHub Actions');
            console.log('3. Use a different path to an existing SARIF file');
            return;
        }

        // Read and parse the SARIF file
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        const report = JSON.parse(reportContent);

        console.log('🔍 Trivy Security Scan Report');
        console.log('=' .repeat(50));

        if (!report.runs || report.runs.length === 0) {
            console.log('✅ No vulnerabilities found or report is empty');
            return;
        }

        let totalVulnerabilities = 0;
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        report.runs.forEach((run, runIndex) => {
            console.log(`\n📊 Run ${runIndex + 1}: ${run.tool?.driver?.name || 'Trivy'} ${run.tool?.driver?.version || ''}`);
            
            if (run.results && run.results.length > 0) {
                console.log(`\n🚨 Found ${run.results.length} vulnerabilities:\n`);
                
                run.results.forEach((result, index) => {
                    const severity = result.level || 'UNKNOWN';
                    const ruleId = result.ruleId || 'Unknown Rule';
                    const message = result.message?.text || 'No description available';
                    const location = result.locations?.[0]?.physicalLocation?.artifactLocation?.uri || 'Unknown location';
                    
                    // Count by severity
                    switch (severity.toLowerCase()) {
                        case 'error':
                            criticalCount++;
                            break;
                        case 'warning':
                            highCount++;
                            break;
                        case 'note':
                            mediumCount++;
                            break;
                        case 'none':
                            lowCount++;
                            break;
                    }
                    totalVulnerabilities++;

                    // Color coding for severity
                    const severityColor = {
                        'error': '🔴',
                        'warning': '🟡', 
                        'note': '🟠',
                        'none': '🟢'
                    };

                    console.log(`${severityColor[severity.toLowerCase()] || '⚪'} ${index + 1}. ${ruleId}`);
                    console.log(`   Severity: ${severity.toUpperCase()}`);
                    console.log(`   Location: ${location}`);
                    console.log(`   Description: ${message}`);
                    
                    // Show additional details if available
                    if (result.properties) {
                        if (result.properties.packageName) {
                            console.log(`   Package: ${result.properties.packageName}`);
                        }
                        if (result.properties.installedVersion) {
                            console.log(`   Installed Version: ${result.properties.installedVersion}`);
                        }
                        if (result.properties.fixedVersion) {
                            console.log(`   Fixed Version: ${result.properties.fixedVersion}`);
                        }
                    }
                    console.log('');
                });
            } else {
                console.log('✅ No vulnerabilities found in this run');
            }
        });

        // Summary
        console.log('📈 Summary:');
        console.log('=' .repeat(30));
        console.log(`Total Vulnerabilities: ${totalVulnerabilities}`);
        console.log(`🔴 Critical: ${criticalCount}`);
        console.log(`🟡 High: ${highCount}`);
        console.log(`🟠 Medium: ${mediumCount}`);
        console.log(`🟢 Low: ${lowCount}`);

        if (totalVulnerabilities > 0) {
            console.log('\n💡 Recommendations:');
            console.log('• Review and address critical and high severity vulnerabilities first');
            console.log('• Update packages to their latest secure versions');
            console.log('• Consider using multi-stage builds to reduce attack surface');
            console.log('• Regularly run security scans as part of your CI/CD pipeline');
        }

    } catch (error) {
        console.error('❌ Error reading Trivy report:', error.message);
        if (error instanceof SyntaxError) {
            console.log('The report file appears to be invalid JSON. Please check the file format.');
        }
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    let reportPath2 = 'trivy-results.sarif'; // Default path
    let reportPath1 = 'trivy-results.19-alpine3.15.sarif'; // Default path
    let reportPath = 'trivy-result-node-3.21.sarif'; // Default path

    // Parse command line arguments
    if (args.length > 0) {
        if (args[0] === '--help' || args[0] === '-h') {
            console.log('🔍 Trivy Report Reader');
            console.log('Usage: node read-trivy-report.js [options] [file-path]');
            console.log('\nOptions:');
            console.log('  --help, -h     Show this help message');
            console.log('  --summary, -s  Show only summary statistics');
            console.log('\nExamples:');
            console.log('  node read-trivy-report.js');
            console.log('  node read-trivy-report.js trivy-results.sarif');
            console.log('  node read-trivy-report.js ./artifacts/trivy-scan-results/trivy-results.sarif');
            return;
        }
        reportPath = args[0];
    }

    // Resolve relative path
    if (!path.isAbsolute(reportPath)) {
        reportPath = path.resolve(process.cwd(), reportPath);
    }

    readTrivyReport(reportPath);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { readTrivyReport }; 