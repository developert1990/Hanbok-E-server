

export const COOKIENAME = {
    HANBOK_COOKIE: 'hanbok_my_token',
    HANBOK_COOKIE_REFRESH: 'hanbok_refresh_token',
}

export const DOMAIN = {
    // PROD: 'ec2-3-80-79-7.compute-1.amazonaws.com',
    // DEV: "localhost",
    PROD: process.env.COOKIE_DOMAIN_PROD,  // 여기서 도메인은 EC2의 Public IPv4 DNS 값이다.(ex => ec2-3-80-79-7.compute-1.amazonaws.com)
    DEV: "localhost",
}

export const COOKIE_EXP = {
    REGULAR_TOKEN_EXP: "5m", // 5분
    // REFRESH_TOKEN_EXP: 1000 * 60 * 60 * 2, // 2시간
    REFRESH_TOKEN_EXP: "30m", // 30분
}
