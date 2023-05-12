const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, "123abc", {
      expiresIn: "12h",
    });
  },

  validateToken: (token) => {
    return jwt.verify(token, "123abc");
  },
};
