const fs = require("fs");

const deleteFiles = (file) => {
  file.forEach((val) => {
    fs.unlink(val.path, function (err) {
      try {
        if (err) throw err;
      } catch (error) {
        console.log(error);
      }
    });
  });
};

module.exports = deleteFiles;
