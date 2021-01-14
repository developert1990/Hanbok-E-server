import { CustomRequestExtendsUser } from './types';
import { NextFunction, Request, Response } from 'express';
import { userFromDB } from './types';
import jwt from 'jsonwebtoken';
import { DOMAIN, COOKIE_EXP, COOKIENAME } from './constants/names';
import { IS_PROD } from './lib/utils';
import cookie from 'cookie';

// 쿠키 도메인 설정
export const getCookieDomain = () => IS_PROD ? DOMAIN.PROD : DOMAIN.DEV;


export const generateToken = async (user: userFromDB, expiresIn = COOKIE_EXP.REGULAR_TOKEN_EXP) => {
    console.log('process.env.JWT_SECRET', process.env.JWT_SECRET)
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    }, process.env.JWT_SECRET as string, {
        expiresIn,
    });
}

export const checkTokenEXP = async (token: string) => {
    console.log('넘어온 token', token)
    let tokenExp;
    if (!token) {
        return "can not check token exp"
    }
    jwt.verify(token as string, process.env.JWT_SECRET as string, (err, decode) => {
        if (err) {
            return `got an err : ${err}`
        } else {
            const now = Math.floor(new Date().getTime() / 1000.0)
            console.log('decode: ', decode)
            console.log('현재시간', now)
            const { _id, name, exp } = decode as decodeType;
            console.log('타임체크: ', (exp - now)) // 초로 계산된다. 10분 남았으면 600초, 20분 남았으면 1200초
            // const remainCookieExpiration = exp - now
            tokenExp = exp
        };
    })
    return tokenExp;
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

    const cookies = cookie.parse(req.headers.cookie as string);
    const token = cookies[COOKIENAME.HANBOK_COOKIE];
    const refreshToken = cookies[COOKIENAME.HANBOK_COOKIE_REFRESH]

    if (token || refreshToken) {
        jwt.verify(token || refreshToken, process.env.JWT_SECRET as string, (err, decode) => {
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
    const cookies = cookie.parse(req.headers.cookie as string);
    // console.log('cookies: ', cookies)
    const token = cookies.hanbok_my_token;

    if (cookies) {
        jwt.verify(token as string, process.env.JWT_SECRET as string, async (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {

                const typedDecod = decode as decodeType
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
        res.status(401).send({ message: 'No Token' });
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