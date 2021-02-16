const multer = require('multer')
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { v1: uuidv1 } = require('uuid');
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}
const fileFilter = (req, file ,cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype]
      let error = isValid ? null : new Error('Invalid mime type!')
      cb(error, isValid)
    }
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1'
});
const fileUpload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname})
      console.log({fieldName: file.fieldname})
    },
    key: function (req, file, cb) {
      const ext = MIME_TYPE_MAP[file.mimetype]
      cb(null, uuidv1() + '.' + ext)
    }
  })
});


// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/images')
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype]
//       cb(null, uuidv1() + '.' + ext)
//     }
//   }),
//   fileFilter: (req, file ,cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype]
//     let error = isValid ? null : new Error('Invalid mime type!')
//     cb(error, isValid)
//   }
// })

module.exports = fileUpload