// ...existing code...
import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';
import app from '../src/index';

process.env.NODE_ENV = 'test'; // asegurar que el server no arranque en tests

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

  afterAll(async () => {
    // limpiar archivo al final
    try {
      await fs.unlink(DATA_FILE);
    } catch {
      // ignore
    }
  });

  test('GET / devuelve Lab 1', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.text).toBe('Lab 1');
  });

  test('GET /msg cuando store está vacío retorna array vacío', async () => {
    const res = await request(app).get('/msg').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /msg crea un mensaje y lo persiste', async () => {
    const res = await request(app)
      .post('/msg')
      .send({ message: 'Hola' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ message: 'Hola' });

    // verificar persistencia en disco
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const arr = JSON.parse(raw);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0].message).toBe('Hola');
  });

  test('POST /msg hace trim y asigna nextId correctamente con ids no consecutivos', async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(
        [
          { id: 2, message: 'm1' },
          { id: 5, message: 'm2' }
        ],
        null,
        2
      ),
      'utf-8'
    );

    const res = await request(app)
      .post('/msg')
      .send({ message: '  Nuevo mensaje  ' })
      .expect(201);

    expect(res.body).toHaveProperty('id', 6);
    expect(res.body).toMatchObject({ message: 'Nuevo mensaje' });
  });

  test('Validaciones POST /msg con body inválido', async () => {
    await request(app).post('/msg').send({ message: '' }).expect(400);
    await request(app).post('/msg').send({}).expect(400);
    await request(app).post('/msg').send({ message: '   ' }).expect(400);
    await request(app).post('/msg').send({ message: 123 }).expect(400);
  });

  test('GET /msg lista mensajes', async () => {
    await request(app).post('/msg').send({ message: 'A' });
    await request(app).post('/msg').send({ message: 'B' });

    const res = await request(app).get('/msg').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('GET /msg/:id obtiene por id y 404 si no existe', async () => {
    const created = await request(app).post('/msg').send({ message: 'X' });
    const id = created.body.id as number;

    const res = await request(app).get(`/msg/${id}`).expect(200);
    expect(res.body).toEqual({ id, message: 'X' });

    await request(app).get('/msg/9999').expect(404);
  });

  test('PUT /msg/:id actualiza mensaje y retorna 404 si id inexistente', async () => {
    const created = await request(app).post('/msg').send({ message: 'Viejo' });
    const id = created.body.id as number;

    const res = await request(app)
      .put(`/msg/${id}`)
      .send({ message: 'Nuevo' })
      .expect(200);

    expect(res.body).toEqual({ id, message: 'Nuevo' });

    const verify = await request(app).get(`/msg/${id}`).expect(200);
    expect(verify.body.message).toBe('Nuevo');

    await request(app).put('/msg/12345').send({ message: 'x' }).expect(404);
  });

  test('DELETE /msg/:id elimina mensaje y 404 si no existe', async () => {
    const created = await request(app).post('/msg').send({ message: 'Borrar' });
    const id = created.body.id as number;

    await request(app).delete(`/msg/${id}`).expect(200);
    await request(app).get(`/msg/${id}`).expect(404);

    await request(app).delete('/msg/4242').expect(404);
  });

  test('Validaciones de id inválido (NaN, Infinity, non-numeric, 0, negativo, float)', async () => {
    await request(app).get('/msg/abc').expect(400);
    await request(app).put('/msg/NaN').send({ message: 'x' }).expect(400);
    await request(app).delete('/msg/Infinity').expect(400);

    await request(app).get('/msg/0').expect(400);
    await request(app).put('/msg/-1').send({ message: 'x' }).expect(400);
    await request(app).delete('/msg/0').expect(400);

    // no integer
    await request(app).get('/msg/1.5').expect(400);
  });

  test('Cuando el JSON del store está corrupto se re-inicializa y permite crear mensajes', async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, 'no es json válido', 'utf-8');

    const res = await request(app).get('/msg').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);

    const created = await request(app).post('/msg').send({ message: 'Ok' }).expect(201);
    expect(created.body).toHaveProperty('id');
    expect(created.body).toMatchObject({ message: 'Ok' });
  });
});