import { COOKIE_EXP } from './../constants/names';
import { userSchemaType, cartItemsType } from './../models/userModel';
import { CustomRequestExtendsUser } from './../types.d';
import { isAuth, isAdmin, getCookieDomain, decodeType, checkTokenEXP } from './../utils';
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import expressAsyncHandler from 'express-async-handler'; // express에서 비동기식으로 에러 헨들링을 하기 위한 라이브러리 이다.
import { userFromDB } from '../types';
import { generateToken } from '../utils';
import messages from '../constants/messages';
import { COOKIENAME } from '../constants/names';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const userRouter = express.Router();

// 바로 url 로 유저 생성 admin 생성하면된다
// userRouter.get('/seed', expressAsyncHandler(async (req: Request, res: Response) => {
//     const createdUsers = await User.insertMany(data.users);
//     res.send({ createdUsers });

// }));


// login 할때 cart item의 list 가져오는 API

// 못하면 뒤짐
// 1. ㄹ로그인 하면 토큰과 리프레시 토큰 둘다 발급 (토큰 10분 레프레시토큰 하루)
// 2. 둘다 프론트에서 쿠키에 저장
// 3. 프론트에서 매분 또는 30초마다 토큰 남온시간 확인
// 4. 유효기간 얼마 안남았을때 모달 띄워서 세션 연장할건지 유저에게 물음
// 4.1 유저가 확인 눌른 시간이 아직 유효기간 만료 전이면 리프레시 토큰 서버에 보내서 새로운 토큰 발급받아 쿠키에 저장
// 4.2 유저가 토큰 유효기간 만료후에 확인을 눌렀을때 로그아웃후 로그인화면으로 리다이렉트트



userRouter.get('/refreshSession', expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response) => {
    console.log("체크하러옴")
    if (!req.headers?.cookie) {
        console.log("쿠키 없어서 튕김")
        res.status(200).send({ message: "need Re-login " });
    }
    // console.log('cookies: ', cookies)
    const cookies = cookie.parse(req.headers?.cookie as string);
    const token = cookies.hanbok_my_token;
    const refreshToken = cookies.hanbok_refresh_token;
    if (token || refreshToken) {
        jwt.verify(token as string || refreshToken as string, process.env.JWT_SECRET as string, async (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {

                const { _id, name, email, exp } = decode as decodeType;
                const user = await User.findOne({ email });
                const typedUser = user as userFromDB;
                const newToken = await generateToken(typedUser);
                const newTokenExp = await checkTokenEXP(newToken); //  만료시간 계산 단, 리프레시 요청을 만료시간 전에 물어보는데 만료가 된다음 refresh 버튼을 눌렀을 경우에 hanbok_my_token은 존재하지 않는다 그렇기 때문에 이러한 상황에서는 refreshToken을 가지고 hanbok_my_token을 재발급해준다.
                // 짧은 만료기간을 가진 일반 토큰 쿠키에 저장 
                res.cookie(COOKIENAME.HANBOK_COOKIE, newToken, {
                    maxAge: 1000 * 60 * 1, httpOnly: true,
                    domain: getCookieDomain()
                });
                res.send({
                    name: typedUser.name,
                    email: typedUser.email,
                    cart: typedUser.cart,
                    tokenExp: newTokenExp,
                });
            }
        });
    } else {
        res.status(200).send({ message: "need Re-login " });
    }
}))







// 프론트에서 시간 체크를 해서 토큰 만료기간 이전에 refresh를 누르면 그냥 refresh 토큰 사용하고 만료기간 이후에 누르면 새로 login 하는 쪽으로 redirect시킨다.
// refresh 토큰 하나 더 같이 발급  좀더 긴거..하루 이틀 짜리
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
    console.log('노드 환경 체크 ==>> ', process.env.NODE_ENV)
    const token = await generateToken(typedUser);
    const refreshToken = await generateToken(typedUser, COOKIE_EXP.REFRESH_TOKEN_EXP);

    const tokenExp = await checkTokenEXP(token); //  만료시간 계산
    const refreshTokenExp = await checkTokenEXP(refreshToken);
    console.log('tokenExp:  ===>>> ', tokenExp)
    console.log('refreshTokenExp', refreshTokenExp)

    if (token && refreshToken) {
        console.log("토큰 받아서 쿠키에 너으러 옴")

        // 짧은 만료기간을 가진 일반 토큰 쿠키에 저장 
        res.cookie(COOKIENAME.HANBOK_COOKIE, token, {
            maxAge: 1000 * 60 * 1, httpOnly: true, // 5 분
            domain: getCookieDomain()
        });

        // 조금 긴 만료기간을 가진 refresh 토큰 쿠키에 저장
        res.cookie(COOKIENAME.HANBOK_COOKIE_REFRESH, refreshToken, {
            maxAge: 1000 * 60 * 2, httpOnly: true, // 30 분
            domain: getCookieDomain()
        })
        console.log('tokenExp====>>> ??? ', tokenExp)
        res.send({
            name: typedUser.name,
            email: typedUser.email,
            cart: typedUser.cart,
            tokenExp: tokenExp,
            refreshTokenExp: refreshTokenExp,
        });
    } else {
        res.status(404).send(messages.INVALID_TOKEN);
    }

}));

// check isAdmin
userRouter.get('/checkAdmin', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    res.status(200).send({ isAdmin: true })

}));


// // user signout 그리고 로그아웃할때 db에  local storage에 있는 제품 전부 저장한다.
userRouter.put('/signout', isAuth, expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response) => {
    const userId = req.user;
    const cartItems = req.body;
    const typedCartItems = cartItems as cartItemsType[];
    const user = await User.findById(userId);
    const typedUser = user as userSchemaType;


    if (typedCartItems.length !== 0) {
        typedUser.cart = [];
        typedCartItems.map((item) => {
            typedUser.cart.push(item);
        })
        await typedUser.save();
    } else {
        typedUser.cart = [];
        await typedUser.save();
    }

    res.clearCookie(COOKIENAME.HANBOK_COOKIE)
    res.clearCookie(COOKIENAME.HANBOK_COOKIE_REFRESH)
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
        res.cookie(COOKIENAME.HANBOK_COOKIE, token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    } else {
        res.status(404).send("Invalid token..");
    }
    res.send({
        name: typedUser.name,
        email: typedUser.email,
    });
    return;
}));

// 자기 계정으로 user profile update 하는 API
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
            res.cookie(COOKIENAME.HANBOK_COOKIE, token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
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

// Admin 계정으로 user update
userRouter.put('/admin/update/:id', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
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






















