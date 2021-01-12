
import { CustomRequestExtendsUser } from './types';
import { NextFunction, Request, Response } from 'express';
import { userFromDB } from './types';
import jwt from 'jsonwebtoken';
import User from './models/userModel';


export const generateToken = (user: userFromDB) => {
    console.log('process.env.JWT_SECRET', process.env.JWT_SECRET)
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    }, process.env.JWT_SECRET as string, {
        expiresIn: '24h',
    });
}

export interface decodeType {
    _id: string;
    name: string;
    email: string,
    isAdmin: boolean,
    iat: number,
    exp: number
}


// 계정으로 접속 햇을 때 API를 사용하기 위해 verify 하는 middleware.
export const isAuth = (req: CustomRequestExtendsUser, res: Response, next: NextFunction) => {
    const authorization = req.headers.cookie;
    const extractToken = authorization?.split(';').reduce((a, c) => {
        let stringToken = "";
        if (c.includes("hanbok_my_token")) {
            stringToken = c;
        }
        return stringToken;
    }, "")

    const token = extractToken?.slice(17);

    if (authorization) {
        jwt.verify(token as string, process.env.JWT_SECRET as string, (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {
                const { _id, name } = decode as decodeType;
                req.user = _id;
                req.name = name;
                next();
            }
        });
    } else {
        res.status(401).send({ message: 'No Token' });
    }

}




// amin계정으로 접속했을 경우에 admin관리를 할 수 있는 페이지에서 동작하는 API를 verify 해주기 위한 middleware
export const isAdmin = (req: CustomRequestExtendsUser, res: Response, next: NextFunction) => {
    const authorization = req.headers.cookie;
    const extractToken = authorization?.split(';').reduce((a, c) => {
        let stringToken = "";
        if (c.includes("hanbok_my_token")) {
            stringToken = c;
        }
        return stringToken;
    }, "")

    const token = extractToken?.slice(17);

    // console.log('토큰뽑기: ', token)

    if (authorization) {
        jwt.verify(token as string, process.env.JWT_SECRET as string, async (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {

                const typedDecod = decode as decodeType
                console.log('typedDecod: ', typedDecod)
                if (typedDecod.isAdmin) {
                    console.log("어드민 true")
                    next();
                } else {
                    console.log("어드민 false")
                    res.status(200).send({ isAdmin: false })
                }

            }
        });
    } else {
        res.status(401).send({ message: 'No cookie passed from browser' });
    }
}



// // console.log("admin인지 확인하러 들어옴")
// // console.log('1: ', req)
// console.log('2: ', req.body)
// // console.log('3: ', req.params)
// console.log('req.params: ', req.params)
// console.log('폼데이타의 유저인포 : ', req.body.formData)
// if (req.user && req.params.isAdmin) {
//     next();
// } else if (req.user && req.body.userInfo.isAdmin) {
//     next();
// } else if (req.user && req.body.formData.userInfo) {
//     next();
// } else {
//     res.status(401).send({ message: 'Invalid Admin Token' });
// }