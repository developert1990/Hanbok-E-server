
import request from 'supertest';
import { server } from '../index';
import User from '../models/userModel';
import bcrypt from 'bcrypt';
import messages from '../constants/messages';

describe('Testing API - user routes', () => {
    const password = '1234';
    const user = {
        _id: "1234",
        name: "sangmean",
        email: "magicq6265@gmail.com",
        password: bcrypt.hashSync(password, 8),
    }
    const apiBody = {
        password,
        email: "magicq6265@gmail.com",
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        server.close();
    });

    test('/api/users/signin - user does exist in the DB', async () => {
        const mockedFind = jest.spyOn(User, 'findOne');
        // @ts-ignore
        mockedFind.mockImplementation(() => Promise.resolve(user));
        const response = await request(server).post('/api/users/signin').send(apiBody); // 여기 send에 user는 api를 post로 보낼때 body값이다.
        console.log(response.body)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', user.name);
        expect(response.body).toHaveProperty('email', user.email);
    });

    test('/api/users/signin - user does not exist in the DB', async () => {
        const mockedFind = jest.spyOn(User, 'findOne');
        //@ts-ignore
        mockedFind.mockImplementation(() => Promise.resolve()); // resolve가 undefined 나 null 여기서 테스트 하는것은 user.findOne에서 email과 매칭되는 유저가 없을 경우에 undefined나 null 이 뜬다고 가정하고 userRouter를 작성하였으므로 이를 고려해서 이렇게 사용한다.
        const response = await request(server).post('/api/users/signin').send(user);
        expect(response.status).toBe(401);
        console.log('response.body: ', response.body)
        expect(response.body).toHaveProperty('message', messages.INVALID_EMAIL);
    });

    // test('/api/users/test', async () => {
    //     const response = await request(server).get('/api/users/test');
    //     expect(response.status).toBe(200);
    // })

});