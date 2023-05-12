// Import Multer
const { multerUpload } = require("./../lib/multer");

//import delete files
const deleteFiles = require("../helper/deleteFiles");

const uploadImages = (req, res, next) => {
  const multerResult = multerUpload.fields([{ name: "images", maxCount: 3 }]);
  multerResult(req, res, function (err) {
    try {
      if (err) throw err;
      //   console.log(req.files.images);

      req.files.images.forEach((val) => {
        if (val.size > 1000000)
          throw { message: `${val.originalname} size too large` };
      });

      next();
    } catch (error) {
      if (req.files.images) {
        deleteFiles(req.files.images);
      }
      res.status(400).send({
        isError: true,
        message: error.message,
        data: null,
      });
    }
  });
};

// const uploadFile = (req, res, next) => {
//   const multerResult = multerUpload.fields([{ name: "files", maxCount: 3 }]);
//   multerResult(req, res, function (err) {
//     try {
//       if (err) throw err;
//     } catch (error) {
//       res.status(400).send({
//         isError: true,
//         message: error.message,
//         data: null,
//       });
//     }
//   });
// };

module.exports = uploadImages;
