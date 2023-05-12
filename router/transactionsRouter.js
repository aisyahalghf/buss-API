const express = require("express");
const Router = express.Router();

const { transactionsController } = require("./../controllers");
const { tokenVerify } = require("./../middleware/verifyToken");
const uploadImage = require("./../middleware/upload");

Router.post("/book/:bus_id", tokenVerify, transactionsController.transaction);
// Router.patch("/book/payment/:id", transactionsController.payment);
Router.post(
  "/book/payments/:transactions_id",
  uploadImage,
  transactionsController.payments
);
Router.get("/book/getAll", tokenVerify, transactionsController.getAll);

module.exports = Router;
