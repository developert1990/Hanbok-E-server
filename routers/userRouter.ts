import { CustomRequestExtendsUser } from './../types.d';
import { isAuth, isAdmin } from './../utils';
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import expressAsyncHandler from 'express-async-handler'; // express에서 비동기식으로 에러 헨들링을 하기 위한 라이브러리 이다.
import { userFromDB } from '../types';
import { generateToken } from '../utils';
import messages from '../constants/messages';
import cookieName from '../constants/cookieName';

const userRouter = express.Router();

// 바로 url 로 유저 생성 admin 생성하면된다
// userRouter.get('/seed', expressAsyncHandler(async (req: Request, res: Response) => {
//     const createdUsers = await User.insertMany(data.users);
//     res.send({ createdUsers });

// }));


// user signin 하는 API
userRouter.post('/signin', expressAsyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    const typedUser = user as userFromDB;

    if (!user) {
        return res.status(401).send({ message: messages.INVALID_EMAIL });
    }

    // 여기 처음에 compareSync로 동기로 작성을 하니까 test할때 에러가 발생해서 비동기로 그냥 다시 바꿔줬다.
    const checkPassword = await bcrypt.compare(req.body.password, typedUser.password)
    if (!checkPassword) {
        return res.status(401).send({ message: messages.INVALID_PASSWORD });
    }

    const token = generateToken(typedUser);
    if (token) {
        console.log("토큰 받아서 쿠키에 너으러 옴")
        res.cookie(cookieName.HANBOK_COOKIE, token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
        res.send({
            name: typedUser.name,
            email: typedUser.email,
        });
    } else {
        res.status(404).send(messages.INVALID_TOKEN);
    }

}));

// check isAdmin
userRouter.get('/checkAdmin', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    res.status(200).send({ message: "Amin user verified" })

}));


// // user signout
userRouter.get('/signout', expressAsyncHandler(async (req: Request, res: Response) => {
    console.log("signout 하러 옴")
    res.clearCookie(cookieName.HANBOK_COOKIE)
    res.status(200).send({ message: "Successfully logged out" })
}))



// user register 하는 API
userRouter.post('/register', expressAsyncHandler(async (req: Request, res: Response) => {
    // 새로운 유저의 정보를 만들고 
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });
    // 그 유저의 정보를 db에 저장한다.
    const createdUser = await user.save();
    const typedUser = createdUser as userFromDB;
    const token = generateToken(typedUser);
    if (token) {
        res.cookie(cookieName.HANBOK_COOKIE, token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    } else {
        res.status(404).send("Invalid token..");
    }
    res.send({
        name: typedUser.name,
        email: typedUser.email,
    });
    return;
}));

// user profile update 하는 API
userRouter.put('/update', isAuth, expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response) => {
    console.log('req.user._id 업데이트 하는곳 들어옴:  ', req.user)
    const userId = req.user;
    const user = await User.findById(userId);
    const typedUser = user as userFromDB;
    if (user) {
        typedUser.name = req.body.name || typedUser.name;
        typedUser.email = req.body.email || typedUser.email;
        if (req.body.password) {
            typedUser.password = bcrypt.hashSync(req.body.password, 8);
        }

        const updatedUser = await typedUser.save();
        const token = generateToken(updatedUser);
        if (token) {
            console.log("토큰 받아서 쿠키에 너으러 옴")
            res.cookie(cookieName.HANBOK_COOKIE, token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
        } else {
            res.status(404).send("Invalid token..");
        }
        res.send({
            name: updatedUser.name,
            email: updatedUser.email,
        });
        return;
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));



// Admin계정으로 모든 user data 받음
userRouter.get('/admin/allList', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const users = await User.find();
    res.send(users);
}));


// Admin계정으로 user delete API
userRouter.delete('/admin/:id', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    const typedUser = user as userFromDB;
    if (user) {
        if (typedUser.email === 'admin@example.com') {
            res.status(400).send({ message: 'Can not delete Admin User' });
            return;
        }
        const deletedUser = await typedUser.remove();
        res.send({ message: 'User Deleted', user: deletedUser });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}))



// Admin계정으로 user detail API
userRouter.get('/admin/detail/:id', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    console.log("유저 디테일 뽑는곳");
    const user = await User.findById(req.params.id);
    if (user) {
        res.send(user)
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}))


userRouter.put('/:id/:isAdmin/update', isAuth, isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    const typedUser = user as userFromDB;
    if (user) {
        typedUser.name = req.body.name || typedUser.name;
        typedUser.email = req.body.email || typedUser.email;
        typedUser.isAdmin = req.body.isAdmin || typedUser.isAdmin;
        typedUser.isSeller = req.body.isSeller || typedUser.isSeller;

        const updatedUser = await typedUser.save();
        res.send({ message: 'User Updated', user: updatedUser })
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}))

export default userRouter;