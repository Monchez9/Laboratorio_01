import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';
import app from '../src/index';

// Ruta del store igual que en tu app: <raíz>/data/messages.json
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

async function resetStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, '[]', 'utf-8');
}

describe('MSG API E2E', () => {
  beforeEach(async () => {
    await resetStore();
  });

  test('POST /msg crea un mensaje', async () => {
    const res = await request(app)
      .post('/msg')
      .send({ message: 'Hola' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ message: 'Hola' });
  });

  test('GET /msg lista mensajes', async () => {
    await request(app).post('/msg').send({ message: 'A' });
    await request(app).post('/msg').send({ message: 'B' });

    const res = await request(app).get('/msg').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('GET /msg/:id obtiene por id', async () => {
    const created = await request(app).post('/msg').send({ message: 'X' });
    const id = created.body.id as number;

    const res = await request(app).get(`/msg/${id}`).expect(200);
    expect(res.body).toEqual({ id, message: 'X' });
  });

  test('PUT /msg/:id actualiza mensaje', async () => {
    const created = await request(app).post('/msg').send({ message: 'Viejo' });
    const id = created.body.id as number;

    const res = await request(app)
      .put(`/msg/${id}`)
      .send({ message: 'Nuevo' })
      .expect(200);

    expect(res.body).toEqual({ id, message: 'Nuevo' });

    const verify = await request(app).get(`/msg/${id}`).expect(200);
    expect(verify.body.message).toBe('Nuevo');
  });

  test('DELETE /msg/:id elimina mensaje', async () => {
    const created = await request(app).post('/msg').send({ message: 'Borrar' });
    const id = created.body.id as number;

    await request(app).delete(`/msg/${id}`).expect(200);

    await request(app).get(`/msg/${id}`).expect(404);
  });

  test('Validaciones: POST /msg con body inválido', async () => {
    await request(app).post('/msg').send({ message: '' }).expect(400);
    await request(app).post('/msg').send({}).expect(400);
  });

  test('Validaciones: GET/PUT/DELETE con id inválido', async () => {
    await request(app).get('/msg/abc').expect(400);
    await request(app).put('/msg/NaN').send({ message: 'x' }).expect(400);
    await request(app).delete('/msg/Infinity').expect(400);
  });
});
