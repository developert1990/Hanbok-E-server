// import { isAuth } from './../utils';
// import AWS from 'aws-sdk';
// import fs from 'fs';
// import multer from 'multer';
// import express, { Request, Response } from 'express';
// import multerS3 from 'multer-s3';

// const uploadRouter = express.Router();

// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1'
// });

// // define storage

// const storage: multer.StorageEngine = multerS3({
//     s3: s3,
//     bucket: "hanbok-application", // 버킷 이름
//     contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
//     acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
//     key: (req, file, cb) => {
//         console.log(file);
//         cb(null, file.originalname)
//     },
// })


// // 이미지 저장경로, 파일명 세팅                  // 용량 제한 
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');    // productEditScreen 에서 bodyFormdata 의 file 이름을 image라고 해줘서


// uploadRouter.post('/', isAuth, (req: Request, res: Response) => {
//     console.log('upload 포스트로 들어옴:  ')
//     upload(req, res, (err: any) => {
//         if (err) { return res.status(404).send({ message: 'Can not upload image' }) };
//         console.log('req.file:___', req.file)
//         return res.send(`${req.file.filename}`)
//     })
// });

// export default uploadRouter;



import { isAuth } from './../utils';
import multer from 'multer';
import express, { Request, Response } from 'express';


const uploadRouter = express.Router();

// define storage
const storage = multer.diskStorage({
    destination: `./public/uploads/`,
    filename(req, file, callback) {
        callback(null, `${Date.now()}.jpg`);
    }
});


const upload = multer({ storage }).single('image'); // productEditScreen 에서 bodyFormdata 의 file 이름을 image라고 해줘서

uploadRouter.post('/', isAuth, (req: Request, res: Response) => {
    console.log('upload 포스트로 들어옴:  ')
    upload(req, res, (err: any) => {
        if (err) { return res.status(404).send({ message: 'Can not upload image' }) };
        console.log('req.file:___', req.file)
        return res.send(`${req.file.filename}`)
    })
});

export default uploadRouter;