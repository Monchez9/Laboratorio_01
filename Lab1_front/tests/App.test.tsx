import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

const mockMessages = [
  { id: 1, message: 'Hola mundo' },
  { id: 2, message: 'Segundo mensaje' },
];

beforeEach(() => {
  mockedAxios.get.mockResolvedValue({ data: mockMessages });
});

afterEach(() => {
  vi.clearAllMocks();
});

test('renders title', () => {
  render(<App />);
  expect(screen.getByText(/Mensajes/i)).toBeInTheDocument();
});

test('fetches and displays messages', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Hola mundo/i)).toBeInTheDocument();
    expect(screen.getByText(/Segundo mensaje/i)).toBeInTheDocument();
  });
});

test('creates a new message', async () => {
  const newMsg = { id: 3, message: 'Nuevo mensaje' };
  mockedAxios.post.mockResolvedValue({ data: newMsg });

  render(<App />);
  const input = screen.getByPlaceholderText(/Nuevo mensaje/i);
  const button = screen.getByText(/Crear/i);

  fireEvent.change(input, { target: { value: newMsg.message } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Nuevo mensaje/i)).toBeInTheDocument();
  });
});

test('deletes a message', async () => {
  mockedAxios.delete.mockResolvedValue({ data: {} });

  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Hola mundo/i)).toBeInTheDocument();
  });

  const deleteButton = screen.getAllByText(/Eliminar/i)[0];
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText(/Hola mundo/i)).not.toBeInTheDocument();
  });
});

test('edits a message', async () => {
  const updatedMsg = { id: 1, message: 'Mensaje editado' };
  mockedAxios.put.mockResolvedValue({ data: updatedMsg });

  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/Hola mundo/i)).toBeInTheDocument();
  });

  const editButton = screen.getAllByText(/Editar/i)[0];
  fireEvent.click(editButton);

  const editInput = screen.getByPlaceholderText(/Nuevo texto/i);
  fireEvent.change(editInput, { target: { value: updatedMsg.message } });

  const updateButton = screen.getByText(/Actualizar/i);
  fireEvent.click(updateButton);

  await waitFor(() => {
    expect(screen.getByText(/Mensaje editado/i)).toBeInTheDocument();
  });
});