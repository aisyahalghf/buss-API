const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aisyahalghifari1",
  database: "starbucks",
});

db.connect((err) => {
  if (err) return console.log("Error" + err.message);

  console.log("connect to database");
});

module.exports = db;
