const fs = require('fs');
const path = require('path');

// Đường dẫn đến file log
const logFile = path.join(__dirname, '../../debug.log');

// Hàm ghi log
const writeLog = (level, message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        error: error ? {
            message: error.message,
            stack: error.stack
        } : null
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Ghi vào file
    fs.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error('❌ Failed to write to log file:', err);
        }
    });
    
    // Cũng hiển thị trong console
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (error) {
        console.error(error);
    }
};

// Export các hàm logging
module.exports = {
    info: (message) => writeLog('info', message),
    error: (message, error) => writeLog('error', message, error),
    debug: (message) => writeLog('debug', message),
    warn: (message) => writeLog('warn', message)
};
