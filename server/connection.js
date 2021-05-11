const mongoClient = require("mongodb").MongoClient;
const database = { db: null };
const url = "mongodb://localhost:27017";

module.exports.connect = (done) => {
  const url = "mongodb://localhost:27017";
  const dbname = "docs-clone";

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) return done(err);
    database.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return database.db;
};
