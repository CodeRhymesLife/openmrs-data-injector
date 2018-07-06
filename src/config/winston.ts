import fs from 'fs';
import winston from 'winston';

const LOG_TAG = '[odi-winston]';

const logDir = 'logs';
const logFilePath = `${logDir}/odi.log`;

// Create the log file path if it doesn't exist
if (!fs.existsSync(logDir)) {
  console.log(`${LOG_TAG} creating log directory`);
  fs.mkdirSync(logDir);
}

// Create a logger that exports to a file and the console
console.log(`${LOG_TAG} creating logger`);
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
  }),  
  transports: [
    new winston.transports.File({
      filename: logFilePath,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

logger.info(`${LOG_TAG} logger created successfully`);
export default logger;

