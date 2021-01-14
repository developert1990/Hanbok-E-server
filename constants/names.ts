

export const COOKIENAME = {
    HANBOK_COOKIE: 'hanbok_my_token',
    HANBOK_COOKIE_REFRESH: 'hanbok_refresh_token',
}

export const DOMAIN = {
    // PROD: 'ec2-3-80-79-7.compute-1.amazonaws.com',
    // DEV: "localhost",
    PROD: process.env.COOKIE_DOMAIN_PROD,
    DEV: "localhost",
}

export const COOKIE_EXP = {
    REGULAR_TOKEN_EXP: 1000 * 60 * 5, // 5분
    // REFRESH_TOKEN_EXP: 1000 * 60 * 60 * 2, // 2시간
    REFRESH_TOKEN_EXP: 1000 * 60 * 12, // 12분
}