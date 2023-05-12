const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const PORT = 4000;
// synchronous

// const Sequelize = require("sequelize");
// const Models = require("./models");

// Models.sequelize
//   .sync({
//     force: false,
//     alter: true,
//     logging: console.log,
//   })
//   .then(function () {
//     console.log("Database is synchronized !");
//   })
//   .catch(function (err) {
//     console.log(err, "Something went wrong with database update!");
//   });

// app.get("/", (req, res) => {
//   res.status(200).send("welcome to our api");
// });

const { usersRouter, transactionsRouter, busRouter } = require("./router");
app.use("/users", usersRouter);
app.use("/bus", transactionsRouter);
app.use("/bus", busRouter);

app.listen(PORT, () => console.log("Api running in port" + PORT));
