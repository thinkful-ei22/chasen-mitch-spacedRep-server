const {dbGet} = require('../db-mongoose');
const{DATABASE_URL} = require('../config');
const Question = require('../models/question');
const seedQuestions = require('../db/seed/questions.json');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
dbGet().connect(DATABASE_URL, {useNewUrlParser: true})
  .then(() => {
    console.info('Dropping Database');
    return dbGet().connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      Question.insertMany(seedQuestions),
      Question.createIndexes(),
    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return dbGet().disconnect();
  })
  .catch(err => {
    console.error(err);
    return dbGet().disconnect();
  });
