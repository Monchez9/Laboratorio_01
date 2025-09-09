import express, { Request, Response } from "express"; 
const app = express(); 
const port = 3000; 

app.get('/', (req: Request, res: Response) => {
  res.send('Lab 1');
});

app.post('/msg', (req: Request, res: Response) => {
  const {message} = req.body;

  if (!message) {
    return res.status(400).json({error: 'Empty message'})
  }

  // escribir mensaje al json
});

app.put('/msg/:id', (req: Request, res: Response) => {
  
});

app.get('/msg/:id', (req: Request, res: Response) => {
  
});

app.delete('/msg/:id', (req: Request, res: Response) => {
  
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});
