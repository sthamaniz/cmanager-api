import * as dotenv from 'dotenv';

//config the app to use the env variables
dotenv.config();

export default {
  appEnv: process.env.ENV || 'development',
  appPort: process.env.PORT || '8080',
  frontendHost: process.env.FRONTEND_URL,
  mongoDbUrl: process.env.MONGO_DB_URL,
  jwtSecret: process.env.JWT_SECRET || 'local_jwt',
  logDir: process.env.LOG_DIR || 'logs',
  logLevel: process.env.LOG_LEVEL || 'debug',
  jobKey: process.env.JOB_KEY,
  mailTransporter: process.env.MAIL_TRANSPORTER || 'etheral',
  mailUser: process.env.MAIL_USER,
  mailPass: process.env.MAIL_PASS,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
