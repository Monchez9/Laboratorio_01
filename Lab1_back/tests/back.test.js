import request from 'supertest';
import app from '../src/index';
describe('API de mensajes', () => {
    it('GET / debería responder con Lab 1', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Lab 1');
    });
    it('POST /msg debería crear un mensaje', async () => {
        const res = await request(app).post('/msg').send({ message: 'Hola test' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.message).toBe('Hola test');
    });
    it('POST /msg vacío debería fallar', async () => {
        const res = await request(app).post('/msg').send({});
        expect(res.status).toBe(400);
    });
});
//# sourceMappingURL=back.test.js.map