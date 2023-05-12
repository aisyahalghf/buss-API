// import Multer

const multer = require("multer");

// import file system
const fs = require("fs");

// 1 setup disk storage & file name
let defaultPath = "Public";
var storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    console.log(file);
    //check directory (exist ot not)
    let isDirectoryExist = fs.existsSync(`${defaultPath}/${file.fieldname}`);

    if (!isDirectoryExist) {
      await fs.promises.mkdir(`${defaultPath}/${file.fieldname}`, {
        recursive: true,
      });
    }

    //to create "public/pdf" or public/images
    if (file.fieldname === "files") {
      cb(null, `${defaultPath}/${file.fieldname}`); // public/files
    }
    if (file.fieldname === "images") {
      cb(null, `${defaultPath}/${file.fieldname}`); // public/image
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "PIMG" +
        "_" +
        Date.now() +
        Math.round(Math.random() * 1000000000) +
        "." +
        file.mimetype.split("/")[1]
    ); //[image,png]
  },
});

// setup file filter
var fileFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.split("/")[0] === "image") {
    //accepts
    cb(null, true);
  } else if (file.mimetype.split("/")[0] !== "image") {
    //reject
    cb(new Error("file must be image!"));
  }
};

// var fileFilter = (req, file, cb) => {
//   console.log(file);
//   if (file.mimetype.split("/")[0] === "files") {
//     //accepts
//     cb(null, true);
//   } else if (file.mimetype.split("/")[0] !== "files") {
//     //reject
//     cb(new Error("file must be files!"));
//   }
// };

exports.multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  //   limits: { fileSize: 100000 },
}); //persatu file satuannya byte
