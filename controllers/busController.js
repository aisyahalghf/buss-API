// import sequelize
const { sequelize, Sequelize } = require("../models");
const { Op } = require("sequelize");

// import model
const db = require("../models/index");
const bus = db.bus;
const rute = db.bus_rute;
const seat = db.transactions;
const detail = db.transaction_detail;

// module.exports = {
//   search: async (req, res) => {
//     try {
//       const { name, from, to, date } = req.query;

//       if (!from && !to && !date) {
//         const findName = await bus.findOne({
//           attributes: ["name"],
//           where: { name },
//           include: [{ model: rute, require: true }],
//         });

//         res.status(200).send({
//           isSuccess: true,
//           message: "get data by name bus success",
//           data: findName,
//         });
//       } else if (!date) {
//         const findNameRute = await bus.findOne({
//           attributes: ["name"],
//           where: { name },
//           include: [
//             {
//               model: rute,
//               require: true,
//               where: { [Op.and]: [{ from }, { to }] },
//               attributes: ["from", "to", "class", "price", "total_seat"],
//             },
//           ],
//         });

//         res.status(200).send({
//           isSuccess: true,
//           message: "get data by name bus, from and to success",
//           data: findNameRute,
//         });
//       } else {
//         const findNameRuteDate = await sequelize.query(
//           `select * from buses_rutes where name= "${name}" and dari="${from}" and tujuan="${to}" and schedule_date = "${date}"`
//         );
//         res.status(200).send({
//           isSuccess: true,
//           message: "get data by name bus, from, to and date success",
//           data: findNameRuteDate[0],
//         });
//       }

//       const getData = await sequelize.query(`select * from buses`);
//       console.log(getData);
//     } catch (error) {
//       res.status(500).send({
//         isSuccess: false,
//         message: error.message,
//       });
//     }
//   },
//   detail: async (req, res) => {
//     const { id } = req.params;

//     // const isPaid = await seat.findOne({
//     //   where: { [Op.and]: [{ bus_id: id }, { status: "paid" }] },
//     // });

//     // if (isPaid === null) {
//     //   const getParams = await bus.findOne({
//     //     attributes: ["id", "name"],
//     //     where: { id: id },
//     //     include: [
//     //       {
//     //         model: rute,
//     //         require: true,
//     //         attributes: ["from", "to", "total_seat", "class", "price"],
//     //       },
//     //     ],
//     //   });

//     //   res.status(200).send({
//     //     isSuccess: true,
//     //     message: "success",
//     //     data: getParams,
//     //   });
//     // } else {
//     //   res.status(200).send({
//     //     isSuccess: true,
//     //     message: "not data",
//     //   });
//     // }

//     // if (isPaid === null) console.log("null");

//     const getParams = await bus.findOne({
//       attributes: ["id", "name"],
//       where: { id },
//       include: [
//         {
//           model: rute,
//           require: true,
//           attributes: ["from", "to", "total_seat", "class", "price"],
//         },
//         {
//           model: seat,
//           require: true,
//           attributes: ["from", "to"],
//           include: [
//             {
//               model: detail,
//               require: true,
//               attributes: ["seat_number"],
//             },
//           ],
//         },
//       ],
//     });

//     res.status(200).send({
//       isSuccess: true,
//       message: "get data by id success",
//       data: getParams,
//     });
//   },
// };

module.exports = {
  search: async (req, res) => {
    try {
      let { from, to, schedule_date } = req.query;
      from = from.replace("%", " ");
      to = to.replace("%", " ");

      await sequelize.query(
        "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      );
      const getData = await sequelize.query(
        ` select  b.id , b.name, br.from, br.to, br.class, br.total_seat,  br.total_seat - count(td.id) as seat_available, br.price
      from transaction_details td
      join transactions t on (t.id = td.transactions_id And (t.status != "cancel" and t.schedule_date= ? or  t.schedule_date= null))
      right join buses b on b.id = t.bus_id
      left join bus_rutes br on br.bus_id = b.id
      where br.from = ? and br.to= ? group by b.id;`,
        {
          replacements: [schedule_date, from, to],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (getData.length === 0)
        throw {
          message: "data not found, please search another from and destination",
        };

      res.status(200).send({
        isSuccess: true,
        message: "Get Data by query successfully",
        data: getData,
      });
    } catch (error) {
      res.status(404).send({
        isSuccess: false,
        message: error.message,
      });
    }
  },
  detail: async (req, res) => {
    try {
      let { schedule_date, from, to } = req.query;
      const { id } = req.params;

      from = from.replace("%", " ");
      to = to.replace("%", " ");

      await sequelize.query(
        "SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      );
      const getData = await sequelize.query(
        `select  b.id , b.name, br.from, br.to, br.class, br.total_seat,  br.total_seat - count(td.id) as seat_available, group_concat(td.seat_number) as seat_number, t.schedule_date,br.price
      from transaction_details td
      right join transactions t on t.id = td.transactions_id 
      right join buses b on (b.id = t.bus_id AND (t.status != "cancel" and  t.schedule_date= ? or  t.schedule_date= null))
      join bus_rutes br on br.bus_id = b.id where br.from= ? and br.to= ? and  b.id= ? group by b.id;`,
        {
          replacements: [schedule_date, from, to, id],
          type: sequelize.QueryTypes.SELECT,
        }
      );
      console.log(getData);

      res.status(200).send({
        isSuccess: true,
        message: "get data by id success",
        data: getData,
      });
    } catch (error) {
      res.status(404).send({
        isSuccess: false,
        message: error.message,
      });
    }
  },
};
