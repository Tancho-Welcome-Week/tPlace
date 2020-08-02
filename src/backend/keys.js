// const dotenv = require('dotenv').config(); //for non docker testing

module.exports = {
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
  isWhitelistPeriod: process.env.WHITELIST,
  isBeta: process.env.BETA,
  botToken: process.env.BOT_TOKEN,
  databaseDeployed: process.env.DEPLOYED_DATABASE,
  adminUserId: process.env.ADMIN_USERID,
  hiddenLargeConstant: process.env.LARGE_PRIME
};
