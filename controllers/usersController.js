// import sequelize
const { sequelize } = require("./../models");
const { Op } = require("sequelize");

// import model
const db = require("./../models/index");
const users = db.users;

// Import hashing
const { hashPassword, hashMatch } = require("./../lib/hash");

// import JWT
const { createToken } = require("./../lib/jwt");

module.exports = {
  register: async (req, res) => {
    try {
      let { username, email, password, role } = req.body;

      // validate password
      let regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,10}$/;
      if (!regxPassword.test(password))
        throw {
          errors: [
            {
              message:
                "password must have min 6 character and max 10 character with number and alphabet",
            },
          ],
        };

      await users.create({
        username,
        email,
        password: await hashPassword(password),
        role,
      });

      res.status(201).send({
        isSuccess: true,
        message: "register success",
        data: null,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        isSuccess: false,
        message: error.errors[0].message,
        data: null,
      });
    }
  },
  login: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.query;
      console.log(usernameOrEmail, password);

      // mengambil data dari database
      const findUser = await users.findOne({
        where: {
          [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        },
      });

      if (findUser === null)
        throw { message: "your email or username not found" };

      const matchPassword = await hashMatch(
        password,
        findUser.dataValues.password
      );
      if (matchPassword === false) throw { message: "your password incorrect" };

      token = createToken({ id: findUser.dataValues.id });

      res.status(200).send({
        isSuccess: true,
        message: "login berhasil",
        token: token,
      });
    } catch (error) {
      res.status(404).send({
        isSuccess: false,
        message: error.message,
        data: null,
      });
    }
  },
  keepLogin: async (req, res) => {
    try {
      let id = req.dataToken.id;

      const getUser = await users.findOne({ where: { id } });
      res.status(200).send({
        isSuccess: true,
        message: "get user successfully",
        data: getUser,
      });
    } catch (error) {
      res.status(404).send({
        isSuccess: false,
        message: error.message,
      });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { password, newPassword } = req.body;
      // validasi data
      const getData = await users.findAll({ where: { id } });
      const userPassword = getData[0].dataValues.password;
      if (userPassword !== password)
        throw { message: "your password incorrect" };
      if (newPassword == userPassword)
        throw { message: "find another password" };
      await users.update(
        {
          password: newPassword,
        },
        { where: { id } }
      );
      res.status(201).send({
        isSuccess: true,
        message: "your password has been update",
        data: null,
      });
    } catch (error) {
      res.status(404).send({
        isSuccess: false,
        message: error.message,
        data: null,
      });
    }
  },
};
