import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

// --------- Tipos y rutas de archivo ----------
type Message = { id: number; message: string };

const app = express();
const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 3000;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

app.use(cors());
app.use(express.json());

// --------- Utilidades de almacenamiento ----------
async function ensureStore(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    // Si no existe, lo creamos con un arreglo vacío
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

async function readStore(): Promise<Message[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw) as Message[];
  } catch {
    // Si el JSON está corrupto, lo re-inicializamos
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    return [];
  }
}

async function writeStore(data: Message[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function nextId(items: Message[]): number {
  const max = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
  return max + 1;
}

// --------- Helper de validación ----------
function parseId(raw: string | undefined): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

// --------- Rutas ----------
app.get('/', (_req: Request, res: Response) => {
  res.send('Lab 1');
});

// Listar todos (opcional pero útil)
app.get('/msg', async (_req: Request, res: Response): Promise<void> => {
  const messages = await readStore();
  res.json(messages);
  return;
});

// Crear mensaje
app.post('/msg', async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'Empty message' });
    return;
  }

  const messages = await readStore();
  const newMsg: Message = { id: nextId(messages), message: message.trim() };
  messages.push(newMsg);
  await writeStore(messages);

  res.status(201).json(newMsg);
  return;
});

// Obtener uno por id
app.get('/msg/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params['id']);
  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const messages = await readStore();
  const msg = messages.find((m) => m.id === id);

  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  res.json(msg);
  return;
});

// Actualizar por id
app.put('/msg/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params['id']);
  const { message } = req.body;

  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  if (typeof message !== 'string' || message.trim() === '') {
    res.status(400).json({ error: 'Empty message' });
    return;
  }

  const messages = await readStore();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  messages[idx]!.message = message.trim();
  await writeStore(messages);
  res.json(messages[idx]);
  return;
});

// Eliminar por id
app.delete('/msg/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req.params['id']);
  if (id === null) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const messages = await readStore();
  const exists = messages.some((m) => m.id === id);

  if (!exists) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  const filtered = messages.filter((m) => m.id !== id);
  await writeStore(filtered);

  res.json({ message: 'Deleted successfully' });
  return;
});

// Solo arrancar el server si NO es test
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    // console.log(`Servidor en http://localhost:${PORT}`);
  });
}

export default app;
