const {dbGet} = require('../db-mongoose');
const {DATABASE_URL} = require('../config');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
dbGet().connect(DATABASE_URL, { useNewUrlParser: true })
  .then(() => {
    console.log('Dropping database');
    return dbGet().connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Disconnecting');
    return dbGet().disconnect();
  })
  .catch(err => {
    console.error(err);
    return dbGet().disconnect();
  });