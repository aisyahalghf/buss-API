const { validateToken } = require("./../lib/jwt");

const jwt = require("jsonwebtoken");

module.exports = {
  tokenVerify: (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({
        error: true,
        message: "token not found",
        isData: false,
        data: null,
      });
    }

    jwt.verify(token, "123abc", (err, dataToken) => {
      try {
        if (err) throw err;
        req.dataToken = dataToken;
        req.dataToken;
        next();
      } catch (error) {
        res.status(500).send({
          isError: true,
          message: error.message,
        });
      }
    });
  },
};
