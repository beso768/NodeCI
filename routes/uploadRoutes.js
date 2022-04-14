const AWS = require('aws-sdk');
const { v1: uuidv1 } = require('uuid');
const requireLogin = require('../middlewares/requireLogin')
const keys = require('../config/keys');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
})

module.exports = app => {
    app.get('/api/upload',requireLogin, (req,res) => {
        const key = `${req.user.id}/${uuidv1()}.jpg`;
        s3.getSignedUrl('putObject',{
            Bucket: 'blog-bucket-12',
            ContentType: 'image/jpeg',
            Key: key
        },(err,url) => res.send({key,url}))
    })
}