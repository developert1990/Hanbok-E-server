import { isAuth } from './../utils';
import AWS from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import express, { Request, Response } from 'express';
import multerS3 from 'multer-s3';
import path from 'path';

const s3 = new AWS.S3();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

const fileFilter = (req: Request, file: any, cb: any) => {
    console.log('file.mimetype ==> ', file.mimetype)
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only JPG and PNG is allowed!"), false);
    }
};


// define storage

const storage: multer.StorageEngine = multerS3({
    //@ts-ignore
    fileFilter,
    s3: s3,
    bucket: "hanbok-app", // 버킷 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
    acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
    key: (req, file, cb) => {
        console.log("file ==> ", file);
        cb(null, `hanbok_products/${new Date()}${path.basename(file.originalname)}`)
    },
    limits: { fileSize: 100 * 1024 * 1024 }
})


// 이미지 저장경로, 파일명 세팅                  // 용량 제한 
export const upload = multer({ storage }).single('image');    // productEditScreen 에서 bodyFormdata 의 file 이름을 image라고 해줘서