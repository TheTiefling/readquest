import { normalize, yearNow } from './utils.js';
import { T } from './strings.js';

const allowed = {
  form: T.forms,
  mode: T.modes,
  content: T.contents,
  status: T.statusValues,
  priority: T.priorities
};

export function validateAuthor(author, data) {
  const errors = {};
  if (!String(author.name || '').trim()) errors.name = T.messages.required;
  else if (data.authors.some(item => Number(item.id) !== Number(author.id || 0) && normalize(item.name) === normalize(author.name))) errors.name = T.validation.duplicateAuthor;
  if (author.countryId && !data.countries.some(country => Number(country.id) === Number(author.countryId))) errors.countryId = T.validation.countryFromList;
  if (author.birthDate && author.birthDate > todayISO) errors.birthDate = T.messages.future;
  if (author.deathDate && author.birthDate && author.deathDate <= author.birthDate) errors.deathDate = T.validation.deathAfterBirth;
  if (author.deathDate && author.deathDate > todayISO) errors.deathDate = T.messages.future;
  return errors;
}

// Datas são comparadas no formato AAAA-MM-DD, que permite comparação direta de strings.
const now = new Date();
const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// Valida os dados do livro e garante que autores/temas existam no catálogo.
export function validateBook(book, data) {
  const errors = {};
  if (!String(book.title || '').trim()) errors.title = T.messages.required;
  if (book.publicationYear !== null && book.publicationYear !== '') {
    const year = Number(book.publicationYear);
    if (!Number.isInteger(year) || year === 0) errors.publicationYear = T.validation.wholeYearNoYearZero;
    else if (year > yearNow()) errors.publicationYear = T.messages.future;
  }
  for (const field of ['form', 'mode', 'content']) {
    if (book[field] && !allowed[field].includes(book[field])) errors[field] = T.validation.chooseFromList;
  }
  const authorIds = book.authorIds || [];
  if (authorIds.some(id => !data.authors.some(author => Number(author.id) === Number(id)))) errors.authorIds = T.validation.existingAuthorsOnly;
  const themeIds = book.themeIds || [];
  if (new Set(themeIds.map(Number)).size !== themeIds.length) errors.themeIds = T.validation.noRepeatedThemes;
  if (themeIds.some(id => !data.themes.some(theme => Number(theme.id) === Number(id)))) errors.themeIds = T.validation.existingThemesOnly;
  return errors;
}

// As regras de ano, nota e prioridade dependem do status escolhido.
export function validateReading(reading, book) {
  const errors = {};
  if (!reading.bookId) errors.bookId = T.messages.noBook;
  if (!allowed.status.includes(reading.status)) errors.status = T.validation.validStatus;
  const yearPresent = reading.yearRead !== null && reading.yearRead !== '';
  const gradePresent = reading.grade !== null && reading.grade !== '';
  if (reading.status === T.status.read && !yearPresent) errors.yearRead = T.validation.yearRequiredForRead;
  if (yearPresent) {
    const year = Number(reading.yearRead);
    if (!Number.isInteger(year)) errors.yearRead = T.validation.wholeYear;
    else if (year > yearNow()) errors.yearRead = T.messages.future;
    else if (book?.publicationYear != null && year < Number(book.publicationYear)) errors.yearRead = T.validation.yearAfterPublication;
    if (![T.status.read, T.status.abandoned].includes(reading.status)) errors.yearRead = T.validation.yearNotAllowed;
  }
  if (gradePresent) {
    const grade = Number(reading.grade);
    if (![T.status.read, T.status.abandoned].includes(reading.status)) errors.grade = T.validation.gradeStatus;
    else if (!Number.isFinite(grade) || grade < 0 || grade > 10 || Math.round(grade * 2) !== grade * 2) errors.grade = T.validation.gradeRange;
  }
  if (reading.priority && !allowed.priority.includes(reading.priority)) errors.priority = T.validation.validPriority;
  if (reading.priority && reading.status !== T.status.wantToRead) errors.priority = T.validation.priorityStatus;
  return errors;
}

export function errorsToPayload(errors) {
  return { status: 400, message: T.validation.failed, errors: Object.entries(errors).map(([field, message]) => ({ field, message })) };
}
