const express = require("express");
const Router = express.Router();

const { busController } = require("../controllers");

Router.get("/search", busController.search);
Router.get("/search/:id", busController.detail);

module.exports = Router;
