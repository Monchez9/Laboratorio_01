import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

type Message = { id: number; message: string };

const API = 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await axios.get<Message[]>(API);
    setMessages(res.data);
  };

  const createMessage = async () => {
    if (!newMessage.trim()) return;
    const res = await axios.post<Message>(API, { message: newMessage });
    setMessages([...messages, res.data]);
    setNewMessage('');
  };

  const deleteMessage = async (id: number) => {
    await axios.delete(`${API}/${id}`);
    setMessages(messages.filter((m) => m.id !== id));
  };

  const startEdit = (msg: Message) => {
    setEditId(msg.id);
    setEditText(msg.message);
  };

  const updateMessage = async () => {
    if (editId === null || !editText.trim()) return;
    const res = await axios.put<Message>(`${API}/${editId}`, { message: editText });
    setMessages(messages.map((m) => (m.id === editId ? res.data : m)));
    setEditId(null);
    setEditText('');
  };

  return (
    <div className="app-container">
      <h1>Mensajes</h1>

      {/* Sección de creación */}
      <div className="create-section">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nuevo mensaje"
        />
        <button onClick={createMessage}>Crear</button>
      </div>

      {/* Lista de mensajes */}
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg.id}>
            <div>
              <strong>#{msg.id}</strong>: {msg.message}
            </div>
            <div>
              <button onClick={() => deleteMessage(msg.id)}>Eliminar</button>
              <button onClick={() => startEdit(msg)}>Editar</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Sección de edición */}
      {editId !== null && (
        <div className="edit-section">
          <h3>Editando #{editId}</h3>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Nuevo texto"
          />
          <button onClick={updateMessage}>Actualizar</button>
          <button onClick={() => setEditId(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default App;