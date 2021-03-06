import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter';
import productRouter from './routers/productRouter';
import * as dotenv from 'dotenv';
import orderRouter from './routers/orderRouter';
import uploadRouter from './routers/uploadRouter';
import emailRouter from './routers/sendEmailRouter';


dotenv.config();

// console.log(process.env);

if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL is not set');
    process.exit(1);
}


// process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV).trim().toLowerCase() == 'production') ? 'production' : 'development';
console.log('process.env.NODE_ENV ==> ', process.env.NODE_ENV)

const corsOption = {
    origin: true,
    credentials: true,
    preFlightContinue: true,
}

const app = express();
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// 이렇게 미들웨어로 public 폴더를 정적으로 만들어줘야 외부에서 로컬호스트의 이 public 폴더로 접속을 할 수가 있다.
app.use(express.static("public"));

const PORT = 9002;
// mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/E-commerce', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
// });

// mongoDB Atlas <==> heroku
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});



// app.use((req: Request, res: Response, next: NextFunction) => {
//     // console.log('req.session.id 아이디 있는지 검사: ', req.session.id)
//     console.log('테스트: ', req)
//     next();
// })



// 제품 사진 upload
app.use('/api/uploads', uploadRouter);

// 유저 등록하는 라우터를 연결
app.use('/api/users/', userRouter);
// 제품 등록하는 라우터를 연결
app.use('/api/products', productRouter);
// 유저가 오더한 것을 등록하는 라우터 연결
app.use('/api/orders', orderRouter);

// PayPal client id 가져오기 위한 API
app.get('/api/config/paypal', (req: Request, res: Response) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
})

// Google API
app.get('/api/config/google', (req: Request, res: Response) => {
    console.log("구글api받으러 들어옴")
    res.send(process.env.GOOGLE_API_KEY || '');
});

// Email send
app.use('/api/email', emailRouter);


app.get('/', (req: Request, res: Response) => {
    res.send('Server is ready');
});


// 위에서 expressAsyncHandler로 감싸준 함수가 에러가 발생하거나 하면 이쪽 미들웨어로 넘어와서 에러 message를 던져준다. userRouter에서 감싸줫기때문에 에러가 발생하면 이쪽으로 넘어와서 에러를 던진다
app.use((err: ErrorEvent, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send({ message: err.message })
})

export const server = app.listen(process.env.PORT || 9002, () => {
    console.log(`Server is running at ${PORT}`)
});