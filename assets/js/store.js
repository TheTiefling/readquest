import { T } from './strings.js';

const STORAGE_KEY = 'readquest.data.v1';
const SEED_URL = new URL('../../data/seed.json', import.meta.url);

// Mantém o acesso ao armazenamento concentrado aqui para facilitar a troca por uma API no Delivery 2.
function readLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error(T.storage.notInitialized);
  return JSON.parse(raw);
}
function writeLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function idFor(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

// Na primeira abertura, importa o arquivo do professor. Nas próximas, usa o que já está salvo.
export async function ensureSeeded() {
  if (localStorage.getItem(STORAGE_KEY)) return readLocal();
  const response = await fetch(SEED_URL);
  if (!response.ok) throw new Error(T.storage.seedRequestFailed.replace('{status}', response.status));
  const seed = await response.json();
  const required = ['countries', 'authors', 'themes', 'books', 'readings'];
  if (!required.every(key => Array.isArray(seed[key]))) throw new Error(T.storage.invalidSeed);
  writeLocal(seed);
  return clone(seed);
}

export async function getAll() { return clone(readLocal()); }
export async function getAuthors() { return clone(readLocal().authors); }
export async function getBooks() { return clone(readLocal().books); }
export async function getReadings() { return clone(readLocal().readings); }
export async function getThemes() { return clone(readLocal().themes); }
export async function getCountries() { return clone(readLocal().countries); }

export async function saveAuthor(author) {
  const data = readLocal();
  const record = { ...author, id: author.id ? Number(author.id) : idFor(data.authors) };
  const index = data.authors.findIndex(item => Number(item.id) === record.id);
  if (index >= 0) data.authors[index] = record; else data.authors.push(record);
  writeLocal(data);
  return clone(record);
}

// Um autor só pode ser removido quando nenhum livro ainda o referencia.
export async function deleteAuthor(id) {
  const data = readLocal();
  const linkedBooks = data.books.filter(book => (book.authorIds || []).some(authorId => Number(authorId) === Number(id)));
  if (linkedBooks.length) {
    const titles = linkedBooks.map(book => book.title);
    const error = new Error(T.storage.authorLinked.replace('{count}', titles.length).replace('{titles}', titles.join(', ')));
    error.status = 409;
    error.errors = [];
    error.linkedBooks = titles;
    throw error;
  }
  data.authors = data.authors.filter(author => Number(author.id) !== Number(id));
  writeLocal(data);
}

export async function saveBook(book) {
  const data = readLocal();
  const record = { ...book, id: book.id ? Number(book.id) : idFor(data.books) };
  const index = data.books.findIndex(item => Number(item.id) === record.id);
  if (index >= 0) data.books[index] = record; else data.books.push(record);
  writeLocal(data);
  return clone(record);
}

export async function deleteBook(id) {
  const data = readLocal();
  const count = data.readings.filter(reading => Number(reading.bookId) === Number(id)).length;
  data.books = data.books.filter(book => Number(book.id) !== Number(id));
  data.readings = data.readings.filter(reading => Number(reading.bookId) !== Number(id));
  writeLocal(data);
  return count;
}

export async function saveReading(reading) {
  const data = readLocal();
  const record = { ...reading, id: reading.id ? Number(reading.id) : idFor(data.readings) };
  const index = data.readings.findIndex(item => Number(item.id) === record.id);
  if (index >= 0) data.readings[index] = record; else data.readings.push(record);
  writeLocal(data);
  return clone(record);
}

export async function deleteReading(id) {
  const data = readLocal();
  data.readings = data.readings.filter(reading => Number(reading.id) !== Number(id));
  writeLocal(data);
}

export async function createTheme(name) {
  const data = readLocal();
  const cleanName = String(name || '').trim();
  const existing = data.themes.find(theme => theme.name.toLocaleLowerCase('en-US') === cleanName.toLocaleLowerCase('en-US'));
  if (existing) return clone(existing);
  const record = { id: idFor(data.themes), name: cleanName };
  data.themes.push(record);
  writeLocal(data);
  return clone(record);
}

// Remove os dados locais e executa novamente a importação do seed original.
export async function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return ensureSeeded();
}

