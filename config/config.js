require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.CONSUMER = process.env.CONSUMER || 'none';
CONFIG.version = '1'; // mayor.menor.micro  
CONFIG.app = process.env.APP || 'dev'; //if app is LOCAL redis server wont be loaded
CONFIG.port = process.env.PORT || '10010';
CONFIG.SWAGGER_BASE_PATH = process.env.SWAGGER_BASE_PATH || "/";

CONFIG.database = {
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "i2cv2",
  user: process.env.DB_USER || "i2cv2",
  password: process.env.DB_PASSWORD || "i2cv2",
  multipleStatements: process.env.DB_MULTIPLE_STATEMENTS || true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 5,
}
// JWT
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'qwerty82';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '1';
CONFIG.jwt_expiration_key = process.env.JWT_EXPIRATION_KEY || 'days'; //  key of time: 'years', 'quarters', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'
CONFIG.jwt_secret_key = process.env.JWT_SECRET_KEY || 'qwerty82';
CONFIG.JWT_BLACKLIST_ENABLE = process.env.JWT_BLACKLIST_ENABLE == "true" || false;

// Default pageSize limit to big entities
CONFIG.DEFAULT_PAGE_SIZE = process.env.DEFAULT_PAGE_SIZE || 50;

// SSL STRIPPING
CONFIG.SSL_STRIPPING = process.env.SSL_STRIPPING || false;

module.exports = CONFIG;
