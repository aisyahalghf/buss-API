// import sequelize
const { sequelize, Sequelize } = require("../models");
const { Op } = require("sequelize");
const transporter = require("../lib/nodemailer");
const deleteFiles = require("./../helper/deleteFiles");

// import model
const db = require("../models/index");
const transactions = db.transactions;
const detail = db.transaction_detail;
const users = db.users;
const busRute = db.bus_rute;
const fs = require("fs").promises;
const handlebars = require("handlebars");

module.exports = {
  transaction: async (req, res) => {
    try {
      const { bus_name, from, to, schedule_date, seat_number, total_price } =
        req.body;
      const { bus_id } = req.params;

      if (seat_number.length > 3)
        throw { message: "cannot book more than 3 seats" };

      await sequelize.query(
        "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      );

      let getData = await transactions.findOne({
        where: { bus_id },
        include: {
          model: detail,
          require: false,
          where: { seat_number },
          attributes: [
            [
              sequelize.fn("GROUP_CONCAT", sequelize.col("seat_number")),
              "seat_number",
            ],
          ],
          group: ["transactions_id"],
        },
      });

      console.log(getData.seat_number);

      if (getData.seat_number)
        throw {
          message: "duplicate seat_number",
          data: getData.transaction_details[0],
        };

      let users_id = req.dataToken.id;
      const createTransactions = await transactions.create({
        bus_name,
        from,
        to,
        schedule_date,
        total_price,
        status: "waiting for payment",
        users_id,
        bus_id,
      });

      const transactions_id = createTransactions.dataValues.id;
      const seat = seat_number.map((val) => {
        return {
          seat_number: val,
          price: total_price / seat_number.length,
          transactions_id,
        };
      });

      await detail.bulkCreate(seat);
      await sequelize.query(
        `create event change_status_transaction_${transactions_id}
        on schedule at DATE_ADD(NOW(),INTERVAL 5 MINUTE)
        DO
        UPDATE transactions set status = "cancel"

        where id = ?;`,
        { replacements: [transactions_id] }
      );

      await sequelize.query(
        `create event delete_detail_transaction_${transactions_id}
        on schedule at DATE_ADD(NOW(),INTERVAL 5 MINUTE)
        DO
        delete from transaction_details 
        where transactions_id = ?;`,
        { replacements: [transactions_id] }
      );

      const result = await transactions.findOne({
        attributes: [
          "id",
          [Sequelize.literal("user.username"), "username"],
          "bus_name",
          "schedule_date",
          "from",
          "to",
          "total_price",
          "expired_date",
          "status",
        ],
        where: { id: transactions_id },
        include: [
          {
            model: detail,
            require: true,
            attributes: ["seat_number", "price"],
          },
          { model: users, require: true, attributes: [] },
        ],
      });

      res.status(201).send({
        isSuccess: true,
        message: "transactions in success",
        data: result,
      });
    } catch (error) {
      res.status(500).send({
        isSuccess: false,
        message: error.message,
        data: error.data,
      });
    }
  },

  // payment: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { invoice } = req.body;
  //     let status = await transactions.findOne({
  //       where: { id },
  //       include: [{ model: users, require: true }],
  //     });

  //     let email = status.user.email;
  //     let newStatus = status.dataValues.status;

  //     if (newStatus === "cancel") {
  //       await detail.destroy({
  //         where: { transactions_id: id },
  //       });
  //       throw {
  //         message: "can not make payments because the status has cancel",
  //       };
  //     }

  //     // await sequelize.query(`drop event change_status_transaction_${id}`);
  //     await transactions.update(
  //       { invoice, status: "paid" },
  //       { where: { id: id } }
  //     );

  //     // // mengirimkan email
  //     let mail = {
  //       from: `Admin <alghifariaisyahputri@gmail.com>`,
  //       to: `${email}`,
  //       subject: `payment`,
  //       html: `<div>
  //       <p>rincian pembayaran</p>
  //       <p>id : ${status.dataValues.id}<p/>
  //       <p>username : ${status.user.username}<p/>
  //       <p>nama travel : ${status.dataValues.bus_name}<p/>
  //       <p>dari : ${status.dataValues.from}<p/>
  //       <p>tujuan : ${status.dataValues.to}<p/>
  //       <p>harga : ${status.dataValues.total_price}<p/>
  //       <p>schedule  : ${status.dataValues.schedule_date}<p/>
  //       </div>`,
  //     };

  //     transporter.sendMail(mail, (error, resMail) => {
  //       res.status(200).send({
  //         isSuccess: true,
  //         message: "payment success, please check your email",
  //       });
  //     });
  //   } catch (error) {
  //     res.status(500).send({
  //       isSuccess: false,
  //       message: error.message,
  //     });
  //   }
  // },

  payments: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { transactions_id } = req.params;

      await sequelize.query(
        "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      );

      let dataTransaction = await transactions.findOne({
        where: { id: transactions_id },
        include: [
          { model: users, require: true },
          {
            model: detail,
            require: true,
            attributes: [
              [
                sequelize.fn("group_concat", sequelize.col("seat_number")),
                "seat_number",
              ],
            ],
            group: ["transactions_id"],
          },
        ],
      });

      const status = dataTransaction.dataValues.status;
      const email = dataTransaction.user.email;

      if (status !== "waiting for payment")
        throw {
          message:
            "can not make payments because the status not waiting for payment",
        };

      // Step-2 Simpan path image nya ke dalam sebuah tabel
      const pathImage = req.files.images[0].path;
      await transactions.update(
        { invoice: pathImage, status: "paid" },
        { where: { id: transactions_id } },
        { transactions: t }
      );

      // Step-4 Hapus event scheduler
      await sequelize.query(
        `drop event if exists change_status_transaction_${transactions_id}`,
        { transactions: t }
      );

      await sequelize.query(
        `drop event if exists delete_detail_transaction_${transactions_id} `,
        { transactions: t }
      );

      // Step-5 Kirim invoice to users email
      let template = await fs.readFile("./template/invoice.html", "utf-8");
      let compiledTemplate = await handlebars.compile(template);
      let newTemplate = compiledTemplate({
        id: dataTransaction.dataValues.id,
        schedule_date: dataTransaction.dataValues.schedule_date,
        from: dataTransaction.dataValues.from,
        to: dataTransaction.dataValues.to,
        price: dataTransaction.dataValues.total_price,
        travel: dataTransaction.dataValues.bus_name,
        username: dataTransaction.user.username,
        seat: dataTransaction.transaction_details[0].seat_number,
      });

      let mail = {
        from: `Admin <alghifariaisyahputri@gmail.com>`,
        to: `${email}`,
        subject: `payment`,
        html: newTemplate,
      };

      t.commit();
      transporter.sendMail(mail, (error, resMail) => {
        res.status(200).send({
          isSuccess: true,
          message: "payment success, please check your email",
        });
      });
    } catch (error) {
      t.rollback();
      if (req.files.images) deleteFiles(req.files.images);
      res.status(400).send({
        isSuccess: false,
        message: error.message,
        data: null,
      });
    }
  },
  getAll: async (req, res) => {
    try {
      const users_id = req.dataToken.id;

      await sequelize.query(
        "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      );

      const getAll = await transactions.findAll({
        attributes: [
          "id",
          "bus_name",
          "from",
          "to",
          "schedule_date",
          "total_price",
          "expired_date",
          "status",
        ],
        where: { [Op.and]: [{ users_id }, { status: "waiting for payment" }] },
        include: [
          {
            model: detail,
            require: true,
            attributes: ["seat_number"],
          },
        ],
      });

      res.status(200).send({
        isSuccess: true,
        message: "get all data success",
        data: getAll,
      });
    } catch (error) {
      res.status(400).send({
        isSuccess: false,
        message: error.message,
      });
    }
  },
};
