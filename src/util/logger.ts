import * as fs from 'fs';

import env from '../env';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Create log directory if it does not exist
if (!fs.existsSync(env.logDir)) {
  fs.mkdirSync(env.logDir);
}
if (!fs.existsSync(`${env.logDir}/access`)) {
  fs.mkdirSync(`${env.logDir}/access`);
}

const transport = new DailyRotateFile({
  filename: `%DATE%.log`,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  dirname: env.logDir,
  prepend: true,
  level: env.logLevel,
  utc: true,
});

transport.on('rotate', function (oldFilename, newFilename) {
  // call function like upload to s3 or on cloud
});

const logger = winston.createLogger({
  transports: [
    transport,
    new winston.transports.Console({
      level: env.logLevel,
      format: winston.format.combine(
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          (info) =>
            `${info.timestamp} ${info.level}: ${info.message} ${
              Object.keys(info.metadata).length
                ? JSON.stringify(info.metadata)
                : ''
            }`,
        ),
      ),
    }),
  ],
});

export default logger;

// Used for access logs
const accessTransport = new DailyRotateFile({
  filename: `%DATE%.log`,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  dirname: `${env.logDir}/access`,
  prepend: true,
  level: env.logLevel,
  utc: true,
});

const accessLogger = winston.createLogger({
  transports: [accessTransport],
});

export const accessLogStream = {
  /**
   * A writable stream for winston logger.
   *
   * @param {any} message
   */
  write(message: string) {
    accessLogger.debug(message.toString());
  },
};
