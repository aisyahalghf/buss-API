const bcrypt = require("bcrypt");
const saltRounds = 10;

// saltRound = berapa kali di looping agar datanya sampe jadi seperti itu

// hashPassword function : Function untuk melakukan hashing pada password yang diterima
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    return null;
  }
};

// hashMatch function : Function untuk melakukan pengecekan dari password yang diinput dengan password yang ada di database
const hashMatch = async (passwordFromLogin, hashedPasswordFromDatabase) => {
  try {
    let match = await bcrypt.compare(
      passwordFromLogin,
      hashedPasswordFromDatabase
    );
    return match;
  } catch (error) {
    return false;
  }
};

module.exports = {
  hashPassword,
  hashMatch,
};
