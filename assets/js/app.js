import * as store from './store.js';
import { T } from './strings.js';
import { byId, nextId } from './utils.js';
import { validateAuthor, validateBook, validateReading, errorsToPayload } from './validation.js';
import { renderShell, renderPage, renderAuthorModal, renderBookModal, renderReadingModal, showModal, closeModal, showToast, showFormErrors, makeCharts, destroyCharts } from './render.js';

// Estado temporário da interface: página atual, filtros, ordenação e dados carregados.
const state = {
  view: 'overview',
  data: null,
  filters: { search: '', status: '', year: '', author: '', form: '', theme: '' },
  sort: { key: 'yearRead', direction: 'desc' },
  searches: { library: '', authors: '' }
};
const charts = {};

// Recarrega os dados pelo módulo de armazenamento. A tela não acessa o localStorage diretamente.
async function loadData() {
  state.data = await store.getAll();
}
// Atualiza a estrutura da página e os gráficos usando o estado atual.
function render() {
  if (!state.data) return;
  destroyCharts(charts);
  document.getElementById('app').innerHTML = renderShell(state.view, state.data);
  document.getElementById('page-content').innerHTML = renderPage(state.view, state.data, state);
  makeCharts(state.view, state.data, charts);
}
async function refresh(message) {
  await loadData();
  render();
  if (message) showToast(message);
}
function openBookModal(id = null, startOnWishlist = false) {
  let book = id ? byId(state.data.books, id) : null;
  if (!book && startOnWishlist) book = { title: '', authorIds: [], publicationYear: '', form: '', mode: '', content: '', themeIds: [], initialReading: { status: T.status.wantToRead, priority: T.priority.medium } };
  showModal(renderBookModal(book, state.data));
}
function openReadingModal(id = null) {
  const reading = id ? byId(state.data.readings, id) : null;
  showModal(renderReadingModal(reading, state.data));
}
function openAuthorModal(id = null) {
  const author = id ? byId(state.data.authors, id) : null;
  showModal(renderAuthorModal(author, state.data));
}
function value(form, name) { return form.elements.namedItem(name)?.value ?? ''; }
function optionalNumber(raw) { return raw === '' ? null : Number(raw); }
function assertValid(errors) {
  if (!Object.keys(errors).length) return;
  const payload = errorsToPayload(errors);
  const error = new Error(payload.message);
  Object.assign(error, payload);
  error.fieldErrors = errors;
  throw error;
}

async function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  try {
    if (action === 'navigate') {
      state.view = button.dataset.view;
      document.getElementById('sidebar')?.classList.remove('sidebar-open');
      document.querySelector('.app-shell')?.classList.remove('menu-open');
      render();
    } else if (action === 'add-book') openBookModal();
    else if (action === 'add-wishlist') openBookModal(null, true);
    else if (action === 'edit-book') openBookModal(Number(button.dataset.id));
    else if (action === 'add-reading') openReadingModal();
    else if (action === 'edit-reading') openReadingModal(Number(button.dataset.id));
    else if (action === 'add-author') openAuthorModal();
    else if (action === 'edit-author') openAuthorModal(Number(button.dataset.id));
    else if (action === 'close-modal') closeModal();
    else if (action === 'backdrop-close' && event.target === button) closeModal();
    else if (action === 'toggle-menu') {
      document.getElementById('sidebar')?.classList.toggle('sidebar-open');
      document.querySelector('.app-shell')?.classList.toggle('menu-open');
    } else if (action === 'close-menu') {
      document.getElementById('sidebar')?.classList.remove('sidebar-open');
      document.querySelector('.app-shell')?.classList.remove('menu-open');
    } else if (action === 'delete-reading') {
      const id = Number(button.dataset.id);
      if (window.confirm(T.messages.confirmReadingDelete)) {
        await store.deleteReading(id);
        await refresh(T.messages.readingDeleted);
      }
    } else if (action === 'delete-book') {
      const id = Number(button.dataset.id);
      const book = byId(state.data.books, id);
      const count = state.data.readings.filter(r => Number(r.bookId) === id).length;
      const message = T.messages.confirmBookDelete.replace('{count}', count);
      if (window.confirm(message)) {
        const deletedCount = await store.deleteBook(id);
        const message = T.messages.bookDeleted
          .replace('{title}', book?.title || T.common.book)
          .replace('{count}', deletedCount);
        await refresh(message);
      }
    } else if (action === 'delete-author') {
      const id = Number(button.dataset.id);
      const author = byId(state.data.authors, id);
      if (window.confirm(T.messages.confirmAuthorDelete.replace('{name}', author?.name || T.common.author))) {
        try {
          await store.deleteAuthor(id);
          await refresh(T.messages.authorDeleted);
        } catch (error) {
          const message = error.linkedBooks?.length ? `${T.messages.linkedAuthor} ${error.linkedBooks.join(', ')}` : error.message;
          showToast(message, 'error');
        }
      }
    } else if (action === 'reset-data') {
      if (window.confirm(T.messages.confirmReset)) {
        state.data = await store.resetData();
        state.filters = { search: '', status: '', year: '', author: '', form: '', theme: '' };
        state.searches = { library: '', authors: '' };
        render();
        showToast(T.messages.reset);
      }
    } else if (action === 'sort-log') {
      const key = button.dataset.key;
      if (state.sort.key === key) state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
      else state.sort = { key, direction: key === 'yearRead' || key === 'grade' ? 'desc' : 'asc' };
      render();
    } else if (action === 'clear-filters') {
      state.filters = { search: '', status: '', year: '', author: '', form: '', theme: '' };
      render();
    } else if (action === 'export-data') exportData();
  } catch (error) {
    console.error(error);
    showToast(error.message || T.messages.genericError, 'error');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'readquest-data.json';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(T.messages.exportReady);
}

async function handleAuthorForm(form) {
  const id = Number(form.dataset.id) || null;
  const author = {
    ...(id ? { id } : {}),
    name: value(form, 'name').trim(),
    countryId: value(form, 'countryId') ? Number(value(form, 'countryId')) : null,
    birthDate: value(form, 'birthDate') || null,
    deathDate: value(form, 'deathDate') || null
  };
  const errors = validateAuthor(author, state.data);
  try { assertValid(errors); } catch (error) { showFormErrors(form, error.fieldErrors); return; }
  await store.saveAuthor(author);
  closeModal();
  await refresh(id ? T.messages.authorUpdated : T.messages.authorCreated);
}

// Salva o livro e, quando marcado no formulário, registra a primeira leitura junto dele.
async function handleBookForm(form) {
  const id = Number(form.dataset.id) || null;
  const authorIds = [...form.querySelectorAll('input[name="authorIds"]:checked')].map(input => Number(input.value));
  const themeIds = [...form.querySelectorAll('input[name="themeIds"]:checked')].map(input => Number(input.value));
  const newTheme = value(form, 'newTheme').trim();
  const book = {
    ...(id ? { id } : {}),
    title: value(form, 'title').trim(),
    authorIds,
    publicationYear: optionalNumber(value(form, 'publicationYear')),
    form: value(form, 'form') || null,
    mode: value(form, 'mode') || null,
    content: value(form, 'content') || null,
    themeIds
  };
  const errors = validateBook(book, state.data);
  try { assertValid(errors); } catch (error) { showFormErrors(form, error.fieldErrors); return; }

  // A primeira leitura é opcional e só é montada quando o usuário marca essa opção.
  let firstReading = null;
  const wantsFirstReading = form.elements.namedItem('addFirstReading')?.checked;
  if (wantsFirstReading) {
    firstReading = {
      bookId: id || nextId(state.data.books),
      status: value(form, 'initialStatus') || T.status.wantToRead,
      yearRead: optionalNumber(value(form, 'initialYearRead')),
      grade: optionalNumber(value(form, 'initialGrade')),
      recommendedBy: value(form, 'initialRecommendedBy').trim() || null,
      priority: value(form, 'initialPriority') || null,
      notes: value(form, 'initialNotes').trim() || null
    };
    // Prioridade só faz sentido enquanto o registro está na lista Want to read.
    if (firstReading.status !== T.status.wantToRead) firstReading.priority = null;
    const readErrors = validateReading(firstReading, book);
    try { assertValid(readErrors); } catch (error) {
      for (const [field, message] of Object.entries(error.fieldErrors)) {
        const target = form.querySelector(`[data-error-for="initial${field[0].toUpperCase()}${field.slice(1)}"]`);
        if (target) target.textContent = message;
        const input = form.querySelector(`[name="initial${field[0].toUpperCase()}${field.slice(1)}"]`);
        if (input) input.classList.add('invalid-field');
      }
      document.getElementById('first-reading-fields')?.classList.add('open');
      return;
    }
  }

  if (newTheme) {
    const theme = await store.createTheme(newTheme);
    book.themeIds = [...new Set([...book.themeIds, Number(theme.id)])];
  }
  const savedBook = await store.saveBook(book);
  if (firstReading) {
    firstReading.bookId = savedBook.id;
    await store.saveReading(firstReading);
  }
  closeModal();
  await refresh(id ? T.messages.bookUpdated : (firstReading ? T.messages.bookCreatedWithReading : T.messages.bookAdded));
}

async function handleReadingForm(form) {
  const id = Number(form.dataset.id) || null;
  const previous = id ? byId(state.data.readings, id) : null;
  const reading = {
    ...(id ? { id } : {}),
    bookId: value(form, 'bookId') ? Number(value(form, 'bookId')) : null,
    status: value(form, 'status'),
    yearRead: optionalNumber(value(form, 'yearRead')),
    grade: optionalNumber(value(form, 'grade')),
    recommendedBy: value(form, 'recommendedBy').trim() || null,
    priority: value(form, 'priority') || null,
    notes: value(form, 'notes').trim() || null
  };

  // Ao sair de Read/Abandoned, ano e nota deixam de ser permitidos.
  if (previous && reading.status !== T.status.read && reading.status !== T.status.abandoned && (previous.yearRead != null || previous.grade != null)) {
    if (!window.confirm(T.messages.confirmClear)) return;
    reading.yearRead = null;
    reading.grade = null;
    form.elements.namedItem('yearRead').value = '';
    form.elements.namedItem('grade').value = '';
  }
  // A prioridade não deve acompanhar uma leitura que saiu da lista de desejos.
  if (previous?.status === T.status.wantToRead && reading.status !== T.status.wantToRead) reading.priority = null;
  if (reading.status !== T.status.wantToRead) reading.priority = null;
  const book = byId(state.data.books, reading.bookId);
  const errors = validateReading(reading, book);
  try { assertValid(errors); } catch (error) { showFormErrors(form, error.fieldErrors); return; }
  await store.saveReading(reading);
  closeModal();
  await refresh(id ? T.messages.readingUpdated : T.messages.readingCreated);
}

async function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  try {
    const kind = form.dataset.form;
    if (kind === 'author') await handleAuthorForm(form);
    else if (kind === 'book') await handleBookForm(form);
    else if (kind === 'reading') await handleReadingForm(form);
  } catch (error) {
    console.error(error);
    showToast(error.message || T.messages.saveFailed, 'error');
  }
}

function handleFilterSubmit(event) {
  if (event.target.id !== 'log-filter-form') return;
  event.preventDefault();
  const form = event.target;
  state.filters = {
    search: value(form, 'search').trim(),
    status: value(form, 'status'),
    year: value(form, 'year'),
    author: value(form, 'author'),
    form: value(form, 'form'),
    theme: value(form, 'theme')
  };
  render();
}

let searchTimer;
function handleSearchInput(event) {
  const target = event.target;
  if (target.id !== 'library-search' && target.id !== 'author-search') return;
  const key = target.id === 'library-search' ? 'library' : 'authors';
  const query = target.value;
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.searches[key] = query;
    const start = target.selectionStart;
    render();
    const replacement = document.getElementById(target.id);
    replacement?.focus();
    replacement?.setSelectionRange(start, start);
  }, 130);
}

function handleModalControls(event) {
  if (event.target.name === 'addFirstReading') {
    document.getElementById('first-reading-fields')?.classList.toggle('open', event.target.checked);
  }
}

async function init() {
  try {
    await store.ensureSeeded();
    await loadData();
    render();
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('submit', handleFilterSubmit);
    document.addEventListener('input', handleSearchInput);
    document.addEventListener('change', handleModalControls);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  } catch (error) {
    console.error(error);
    document.getElementById('app').innerHTML = `<main class="startup-error"><div class="startup-error-mark">RQ</div><div class="eyebrow">${T.ui.startup.eyebrow}</div><h1>${T.ui.startup.title}</h1><p>${T.messages.seedError}</p><code>${String(error.message || error)}</code><p class="startup-tip">${T.ui.startup.help}</p></main>`;
  }
}

init();
