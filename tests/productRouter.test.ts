import request from 'supertest';
import { server } from '../index';

describe('Testing API - product routes', () => {
    afterAll(() => {
        server.close();
    });

    test('/api/products/list/:name/:category/:priceLessThan/:sortBy', async (done) => {
        const response = await request(server).get('/api/products/list/all/all/0/lowest');
        expect(response.status).toBe(200);
        done();
    });
});