const express = require("express");
const Router = express.Router();

const { usersController } = require("../controllers");
const { tokenVerify } = require("./../middleware/verifyToken");

Router.post("/register", usersController.register);
Router.get("/login", usersController.login);
Router.get("/keep-login", tokenVerify, usersController.keepLogin);
Router.patch("/update-password/:id", usersController.updatePassword);

module.exports = Router;
