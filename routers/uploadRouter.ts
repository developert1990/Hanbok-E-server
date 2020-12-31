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