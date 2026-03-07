const { exec } = require('child_process');
const fs = require('fs');

async function checkXAMPPStatus() {
    console.log('🔍 Checking XAMPP Status...\n');
    
    // 1. Check if XAMPP is installed
    console.log('📋 Checking XAMPP Installation...');
    
    const possiblePaths = [
        'C:/xampp',
        'D:/xampp',
        'C:/xampp2',
        'D:/xampp2'
    ];
    
    let xamppPath = null;
    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            xamppPath = path;
            console.log(`✅ XAMPP found at: ${path}`);
            break;
        }
    }
    
    if (!xamppPath) {
        console.log('❌ XAMPP not found in common locations');
        console.log('💡 Please install XAMPP or specify the correct path');
        return;
    }
    
    // 2. Check XAMPP services status
    console.log('\n📋 Checking XAMPP Services...');
    
    const services = ['Apache', 'MySQL'];
    
    for (const service of services) {
        console.log(`\n🔍 Checking ${service}...`);
        
        try {
            // Check Windows service
            await new Promise((resolve, reject) => {
                exec(`sc query "${service}"`, (error, stdout, stderr) => {
                    if (stdout.includes('RUNNING')) {
                        console.log(`✅ ${service} is running`);
                    } else {
                        console.log(`❌ ${service} is not running`);
                    }
                    resolve();
                });
            });
            
            // Check process
            await new Promise((resolve, reject) => {
                exec(`tasklist | findstr "${service.toLowerCase()}"`, (error, stdout, stderr) => {
                    if (stdout.includes(service.toLowerCase())) {
                        console.log(`✅ ${service} process found`);
                    } else {
                        console.log(`❌ ${service} process not found`);
                    }
                    resolve();
                });
            });
            
        } catch (error) {
            console.log(`❌ Error checking ${service}:`, error.message);
        }
    }
    
    // 3. Check ports
    console.log('\n📋 Checking Common Ports...');
    
    const ports = [
        { name: 'Apache', port: 80, altPort: 8080 },
        { name: 'MySQL', port: 3306, altPort: 3307 }
    ];
    
    for (const portInfo of ports) {
        console.log(`\n🔍 Checking ${portInfo.name} (port ${portInfo.port})...`);
        
        try {
            await new Promise((resolve, reject) => {
                exec(`netstat -an | findstr ":${portInfo.port}"`, (error, stdout, stderr) => {
                    if (stdout.includes(`:${portInfo.port}`)) {
                        console.log(`✅ Port ${portInfo.port} is in use`);
                    } else {
                        console.log(`❌ Port ${portInfo.port} is not in use`);
                        
                        // Check alternative port
                        if (portInfo.altPort) {
                            exec(`netstat -an | findstr ":${portInfo.altPort}"`, (altError, altStdout) => {
                                if (altStdout.includes(`:${portInfo.altPort}`)) {
                                    console.log(`✅ Alternative port ${portInfo.altPort} is in use`);
                                } else {
                                    console.log(`❌ Alternative port ${portInfo.altPort} is not in use`);
                                }
                            });
                        }
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.log(`❌ Error checking port ${portInfo.port}:`, error.message);
        }
    }
    
    // 4. Check XAMPP control panel
    console.log('\n📋 Checking XAMPP Control Panel...');
    
    try {
        await new Promise((resolve, reject) => {
            exec('tasklist | findstr "xampp-control"', (error, stdout, stderr) => {
                if (stdout.includes('xampp-control')) {
                    console.log('✅ XAMPP Control Panel is running');
                } else {
                    console.log('❌ XAMPP Control Panel is not running');
                }
                resolve();
            });
        });
    } catch (error) {
        console.log('❌ Error checking XAMPP Control Panel:', error.message);
    }
    
    // 5. Summary and recommendations
    console.log('\n📋 Summary & Recommendations:');
    console.log('=====================================');
    
    console.log('\n💡 If services are not running:');
    console.log('   1. Open XAMPP Control Panel');
    console.log('   2. Start Apache and MySQL services');
    console.log('   3. Check for port conflicts');
    
    console.log('\n💡 If ports are in use by other applications:');
    console.log('   1. Stop conflicting applications');
    console.log('   2. Change XAMPP ports in config');
    console.log('   3. Restart XAMPP services');
    
    console.log('\n💡 XAMPP Default Configuration:');
    console.log('   - Apache Port: 80');
    console.log('   - MySQL Port: 3306');
    console.log('   - Document Root: C:/xampp/htdocs');
    console.log('   - MySQL Data: C:/xampp/mysql/data');
}

// Run the check
checkXAMPPStatus();
