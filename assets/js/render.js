import { T } from './strings.js';
import { escapeHtml as e, byId, authorNames, formatYear, formatGrade, initials, statusClass, priorityRank, compareMissingLast, centuryLabel, average, unique } from './utils.js';

const iconPaths = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  log: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  library: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8"/>',
  wishlist: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  authors: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  insights: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  edit: '<path d="m15 5 4 4M4 20l4-.8L19.2 8a2.8 2.8 0 0 0-4-4L4 15.2z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/>',
  spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1z"/>',
  filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
};
export const icon = (name, size = 18) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.spark}</svg>`;

export function renderShell(activeView, data) {
  const nav = Object.entries(T.nav).map(([key, label]) => `<button class="nav-link ${activeView === key ? 'active' : ''}" data-action="navigate" data-view="${key}">${icon(key)}<span>${e(label)}</span>${key === 'wishlist' ? `<span class="nav-count">${data.readings.filter(r => r.status === T.status.wantToRead).length}</span>` : ''}</button>`).join('');
  return `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand-lockup"><div class="brand-mark">${icon('book', 22)}</div><div><div class="brand-name">${T.appName}<span class="brand-dot">.</span></div><div class="brand-subtitle">${T.tagline}</div></div></div>
        <div class="sidebar-label">${T.ui.shell.workspace}</div>
        <nav class="main-nav" aria-label="${T.ui.shell.mainNavigation}">${nav}</nav>
        <div class="sidebar-bottom">
          <div class="storage-card"><div class="storage-icon">${icon('spark', 17)}</div><div><strong>${T.ui.shell.localSaveActive}</strong><span>${T.ui.shell.savedInBrowser}</span></div><span class="online-dot"></span></div>
          <button class="nav-link" data-action="reset-data">${icon('refresh')}<span>${T.ui.shell.restoreStarterData}</span></button>
          <div class="sidebar-footnote">READQUEST <span>·</span> ${T.ui.shell.deliveryLabel}</div>
        </div>
      </aside>
      <div class="mobile-scrim" data-action="close-menu"></div>
      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left"><button class="icon-button mobile-menu" data-action="toggle-menu" aria-label="${T.ui.shell.openNavigation}">${icon('menu', 21)}</button><div class="breadcrumb">${T.ui.shell.workspace} <span>/</span> <strong>${e(T.nav[activeView])}</strong></div></div>
          <div class="topbar-actions"><div class="local-status"><span class="online-dot"></span> ${T.ui.shell.allChangesSaved}</div><button class="icon-button" data-action="export-data" title="${T.ui.shell.exportData}" aria-label="${T.ui.shell.exportData}">${icon('download')}</button><button class="button button-primary button-small" data-action="add-book">${icon('plus', 16)}<span>${T.ui.forms.addBook}</span></button></div>
        </header>
        <div class="page-container" id="page-content"></div>
      </main>
    </div>`;
}

function pageHeader(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${e(eyebrow)}</div><h1>${title}</h1><p>${e(description)}</p></div>${action}</div>`;
}
function statCard(label, value, foot, type, glyph, trend = '') {
  return `<article class="stat-card"><div class="stat-top"><span>${e(label)}</span><span class="stat-icon ${type}">${icon(glyph, 19)}</span></div><div class="stat-value">${e(value)}</div><div class="stat-foot">${trend ? `<span class="stat-trend">${e(trend)}</span>` : ''}<span>${e(foot)}</span></div></article>`;
}
function emptyState(title, description, action = '') {
  return `<div class="empty-state"><div class="empty-art">${icon('book', 28)}</div><strong>${e(title)}</strong><p>${e(description)}</p>${action}</div>`;
}
function statusPill(status) {
  return `<span class="status-pill ${statusClass(status)}"><i></i>${e(status)}</span>`;
}
function cover(book, index = 0, large = false) {
  const palettes = ['cover-violet', 'cover-blue', 'cover-teal', 'cover-rose', 'cover-amber', 'cover-indigo'];
  return `<div class="book-cover ${large ? 'book-cover-large' : ''} ${palettes[Math.abs(Number(book.id || index)) % palettes.length]}"><span class="cover-lines"></span><span class="cover-mark">${e(initials(book.title))}</span><span class="cover-bottom">${T.ui.shell.coverText}</span></div>`;
}
function readingViewLink(label) {
  return `<button class="text-link" data-action="navigate" data-view="log">${e(label)} ${icon('arrow', 14)}</button>`;
}

export function renderOverview(data) {
  const completed = data.readings.filter(r => r.status === T.status.read);
  const active = data.readings.filter(r => [T.status.reading, T.status.paused].includes(r.status));
  const queue = data.readings.filter(r => r.status === T.status.wantToRead);
  const graded = data.readings.filter(r => r.grade != null);
  const avgGrade = average(graded.map(r => Number(r.grade)));
  const recent = [...completed].sort((a, b) => (Number(b.yearRead || 0) - Number(a.yearRead || 0)) || (Number(b.id) - Number(a.id))).slice(0, 5);
  const highRated = [...graded].sort((a, b) => Number(b.grade) - Number(a.grade)).slice(0, 3);
  const completedYears = unique(completed.map(r => r.yearRead).filter(v => v != null)).sort((a, b) => b - a);
  return `${pageHeader(T.sections.overviewEyebrow, `${T.ui.overview.title}<span class="heading-period">.</span>`, T.ui.overview.description, `<button class="button button-secondary" data-action="add-reading">${icon('plus', 16)} ${T.ui.overview.logReading}</button>`)}
    <section class="welcome-banner"><div class="welcome-grid"></div><div class="welcome-copy"><span class="banner-kicker"><span class="pulse-dot"></span> ${T.ui.overview.onlineLabel}</span><h2>${T.ui.overview.welcomeTitle}<br>${T.ui.overview.welcomeConnector} <em>${T.ui.overview.welcomeEmphasis}</em></h2><p>${T.ui.overview.welcomeDescription}</p><div class="banner-actions"><button class="button button-light" data-action="add-book">${T.ui.overview.addToLibrary} ${icon('arrow', 15)}</button><span class="banner-note">${data.books.length} ${T.ui.overview.archiveCount}</span></div></div><div class="banner-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="banner-cube">${icon('book', 68)}</div><span class="banner-star star-a">✦</span><span class="banner-star star-b">✧</span><span class="banner-cross">+</span></div></section>
    <section class="stats-grid">${statCard(T.ui.overview.booksInLibrary, data.books.length, T.ui.overview.uniqueTitles, 'violet', 'library')}${statCard(T.ui.overview.completedReadings, completed.length, T.ui.overview.completedSessions, 'green', 'book')}${statCard(T.ui.overview.inProgress, active.length, `${active.filter(r => r.status === T.status.reading).length} ${T.ui.overview.readingUnit} · ${active.filter(r => r.status === T.status.paused).length} ${T.ui.overview.pausedUnit}`, 'blue', 'insights')}${statCard(T.ui.overview.onWishlist, queue.length, T.ui.overview.waitingQueue, 'amber', 'wishlist')}${statCard(T.ui.overview.averageGrade, avgGrade == null ? '—' : avgGrade.toFixed(1), `${graded.length} ${T.ui.overview.gradedRecords}`, 'pink', 'spark')}</section>
    <section class="dashboard-grid"><article class="panel chart-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.overview.readingActivity}</div><h3>${T.ui.overview.storiesCompleted}</h3><p>${T.ui.overview.completedByYear}</p></div><span class="chart-badge">${completedYears.length ? `${completedYears[0]} – ${completedYears[completedYears.length - 1]}` : T.ui.overview.noData}</span></div><div class="chart-wrap"><canvas id="overview-year-chart" aria-label="${T.ui.overview.completedByYear}"></canvas></div></article><article class="panel queue-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.overview.upNext}</div><h3>${T.ui.overview.activeQueue}</h3><p>${T.ui.overview.pickUp}</p></div>${readingViewLink(T.ui.overview.viewAll)}</div><div class="queue-list">${queue.length ? [...queue].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 4).map((r, i) => { const b = byId(data.books, r.bookId); return `<button class="queue-item" data-action="edit-reading" data-id="${r.id}"><span class="queue-index">0${i + 1}</span><span class="queue-cover">${cover(b || { id: r.id, title: '?' }, i)}</span><span class="queue-info"><strong>${e(b?.title || T.common.unknownBook)}</strong><small>${e(authorNames(b || {}, data.authors))}</small></span><span class="priority-dot priority-${e((r.priority || 'none').toLowerCase())}" title="${e(r.priority || T.common.noPriority)}"></span></button>` }).join('') : emptyState(T.ui.overview.queueClear, T.ui.overview.addAndQueue)}</div></article></section>
    <section class="dashboard-grid lower-grid"><article class="panel table-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.overview.recentActivity}</div><h3>${T.ui.overview.recentlyCompleted}</h3><p>${T.ui.overview.latestRecords}</p></div>${readingViewLink(T.ui.overview.openLog)}</div>${recent.length ? `<div class="mini-table"><div class="mini-table-head"><span>${T.ui.log.bookColumn}</span><span>${T.ui.log.yearColumn}</span><span>${T.ui.log.gradeColumn}</span></div>${recent.map(r => { const b = byId(data.books, r.bookId); return `<div class="mini-table-row"><span class="mini-book"><span class="mini-cover">${e(initials(b?.title))}</span><span><strong>${e(b?.title || T.common.unknownBook)}</strong><small>${e(authorNames(b || {}, data.authors))}</small></span></span><span class="muted-value">${e(r.yearRead ?? '—')}</span><span class="grade-chip">${e(formatGrade(r.grade))}</span></div>` }).join('')}</div>` : emptyState(T.ui.overview.noCompleted, T.ui.overview.historyAppears)}</article><article class="panel top-rated-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.overview.hallOfFame}</div><h3>${T.ui.overview.highestRated}</h3><p>${T.ui.overview.topScoring}</p></div><span class="trophy-mark">✦</span></div>${highRated.length ? highRated.map((r, i) => { const b = byId(data.books, r.bookId); return `<div class="rated-row"><span class="rank-number">0${i + 1}</span>${cover(b || { id: r.id, title: '?' }, i)}<span class="rated-info"><strong>${e(b?.title || T.common.unknownBook)}</strong><small>${e(authorNames(b || {}, data.authors))}</small></span><span class="rated-grade">${e(formatGrade(r.grade))}<small>/ 10</small></span></div>` }).join('') : emptyState(T.ui.overview.noGrades, T.ui.overview.ratedBooksRanked)}</article></section>`;
}

function sortableHead(label, key, sort) {
  const active = sort.key === key;
  return `<button class="sort-button ${active ? 'sorted' : ''}" data-action="sort-log" data-key="${key}">${e(label)} ${active ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</button>`;
}
export function renderLog(data, state) {
  const { filters, sort } = state;
  const years = unique(data.readings.map(r => r.yearRead).filter(v => v != null)).sort((a, b) => b - a);
  let records = [...data.readings].filter(r => {
    const book = byId(data.books, r.bookId) || {};
    const text = `${book.title || ''} ${authorNames(book, data.authors)}`.toLocaleLowerCase('en-US');
    const matchSearch = !filters.search || text.includes(filters.search.toLocaleLowerCase('en-US'));
    const matchStatus = !filters.status || r.status === filters.status;
    const matchYear = !filters.year || String(r.yearRead ?? '') === filters.year;
    const matchAuthor = !filters.author || (book.authorIds || []).some(id => Number(id) === Number(filters.author));
    const matchForm = !filters.form || book.form === filters.form;
    const matchTheme = !filters.theme || (book.themeIds || []).some(id => Number(id) === Number(filters.theme));
    return matchSearch && matchStatus && matchYear && matchAuthor && matchForm && matchTheme;
  });
  const compare = (a, b) => {
    const bookA = byId(data.books, a.bookId) || {}; const bookB = byId(data.books, b.bookId) || {};
    let valA, valB;
    if (sort.key === 'title') { valA = bookA.title; valB = bookB.title; }
    else if (sort.key === 'authors') { valA = (bookA.authorIds || []).length ? authorNames(bookA, data.authors) : null; valB = (bookB.authorIds || []).length ? authorNames(bookB, data.authors) : null; }
    else if (sort.key === 'status') { valA = a.status; valB = b.status; }
    else if (sort.key === 'yearRead') { valA = a.yearRead; valB = b.yearRead; }
    else if (sort.key === 'grade') { valA = a.grade; valB = b.grade; }
    const sorted = compareMissingLast(valA, valB, sort.direction);
    return sorted || Number(a.id) - Number(b.id);
  };
  records.sort(compare);
  const rows = records.map(r => { const book = byId(data.books, r.bookId) || {}; return `<tr><td><div class="book-cell"><span class="table-cover">${e(initials(book.title))}</span><span><strong>${e(book.title || T.common.unknownBook)}</strong><small>${e(formatYear(book.publicationYear))}</small></span></div></td><td>${e((book.authorIds || []).length ? authorNames(book, data.authors) : '-')}</td><td>${statusPill(r.status)}</td><td>${e(r.yearRead ?? '-')}</td><td><span class="grade-value ${r.grade == null ? 'empty' : ''}">${e(r.grade == null ? '-' : formatGrade(r.grade))}</span></td><td><div class="row-actions"><button class="icon-button subtle" data-action="edit-reading" data-id="${r.id}" title="${T.ui.log.editReading}" aria-label="${T.ui.log.editReading}">${icon('edit', 15)}</button><button class="icon-button subtle danger-hover" data-action="delete-reading" data-id="${r.id}" title="${T.ui.log.deleteReading}" aria-label="${T.ui.log.deleteReading}">${icon('trash', 15)}</button></div></td></tr>` }).join('');
  // Registros sem ano ou nota ficam no final da ordenação, conforme o requisito FR-05.
  return `${pageHeader(T.sections.logEyebrow, `${T.ui.log.title}<span class="heading-period">.</span>`, T.ui.log.description, `<button class="button button-primary" data-action="add-reading">${icon('plus', 16)} ${T.ui.log.addReading}</button>`)}
  <section class="panel filters-panel"><form id="log-filter-form" class="filter-grid"><label class="search-field">${icon('search', 17)}<input type="search" name="search" placeholder="${T.ui.log.searchPlaceholder}" value="${e(filters.search)}"></label><label class="filter-select"><span>${T.ui.log.statusColumn}</span><select name="status"><option value="">${T.ui.log.allStatuses}</option>${T.statusValues.map(v => `<option ${filters.status === v ? 'selected' : ''}>${e(v)}</option>`).join('')}</select></label><label class="filter-select"><span>${T.ui.log.yearFilter}</span><select name="year"><option value="">${T.ui.log.allYears}</option>${years.map(v => `<option value="${v}" ${filters.year === String(v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label class="filter-select"><span>${T.ui.log.authorColumn}</span><select name="author"><option value="">${T.ui.log.allAuthors}</option>${[...data.authors].sort((a, b) => a.name.localeCompare(b.name)).map(a => `<option value="${a.id}" ${filters.author === String(a.id) ? 'selected' : ''}>${e(a.name)}</option>`).join('')}</select></label><label class="filter-select"><span>${T.ui.render.formFilterLabel}</span><select name="form"><option value="">${T.ui.log.allForms}</option>${T.forms.map(v => `<option ${filters.form === v ? 'selected' : ''}>${e(v)}</option>`).join('')}</select></label><label class="filter-select"><span>${T.ui.render.themeFilterLabel}</span><select name="theme"><option value="">${T.ui.log.allThemes}</option>${[...data.themes].sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${t.id}" ${filters.theme === String(t.id) ? 'selected' : ''}>${e(t.name)}</option>`).join('')}</select></label><button class="button button-secondary filter-submit" type="submit">${icon('filter', 15)} ${T.ui.log.apply}</button><button class="button button-ghost filter-clear" type="button" data-action="clear-filters">${T.ui.log.clear}</button></form></section>
  <section class="panel data-panel"><div class="data-panel-top"><div><strong>${records.length} <span class="muted-inline">${T.ui.log.recordCount}</span></strong><span class="data-subtitle">${T.ui.log.missingValues}</span></div><button class="button button-ghost button-small" data-action="export-data">${icon('download', 15)} ${T.ui.log.exportJson}</button></div>${records.length ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>${sortableHead(T.ui.log.bookColumn, 'title', sort)}</th><th>${sortableHead(T.ui.log.authorColumn, 'authors', sort)}</th><th>${sortableHead(T.ui.log.statusColumn, 'status', sort)}</th><th>${sortableHead(T.ui.log.yearColumn, 'yearRead', sort)}</th><th>${sortableHead(T.ui.log.gradeColumn, 'grade', sort)}</th><th class="actions-head">${T.ui.log.actionsColumn}</th></tr></thead><tbody>${rows}</tbody></table></div>` : emptyState(T.ui.log.noMatches, T.ui.log.changeFilters)}</section>`;
}

export function renderLibrary(data, search = '') {
  const term = search.toLocaleLowerCase('en-US');
  const books = [...data.books].filter(b => `${b.title} ${authorNames(b, data.authors)}`.toLocaleLowerCase('en-US').includes(term)).sort((a, b) => a.title.localeCompare(b.title));
  const cards = books.map((b, i) => { const readings = data.readings.filter(r => Number(r.bookId) === Number(b.id)); const readCount = readings.filter(r => r.status === T.status.read).length; const tags = (b.themeIds || []).map(id => byId(data.themes, id)?.name).filter(Boolean).slice(0, 2); return `<article class="library-card"><div class="library-card-cover">${cover(b, i, true)}<span class="book-card-count">${readings.length} ${readings.length === 1 ? T.common.entry : T.common.entries}</span></div><div class="library-card-body"><div class="book-meta-line">${e(b.form || T.ui.library.uncategorized)} <span>·</span> ${e(formatYear(b.publicationYear))}</div><h3>${e(b.title)}</h3><p>${e(authorNames(b, data.authors))}</p><div class="book-tags">${tags.map(t => `<span>${e(t)}</span>`).join('') || `<span>${T.ui.library.uncategorized}</span>`}</div><div class="library-card-foot"><span>${readCount} ${T.ui.library.completed} ${readCount === 1 ? T.common.read : T.common.reads}</span><div class="row-actions"><button class="icon-button subtle" data-action="edit-book" data-id="${b.id}" title="${T.ui.forms.editBook}" aria-label="${T.ui.forms.editBook}">${icon('edit', 15)}</button><button class="icon-button subtle danger-hover" data-action="delete-book" data-id="${b.id}" title="${T.ui.library.deleteBook}" aria-label="${T.ui.library.deleteBook}">${icon('trash', 15)}</button></div></div></div></article>` }).join('');
  return `${pageHeader(T.sections.libraryEyebrow, `${T.ui.library.title}<span class="heading-period">.</span>`, T.ui.library.description, `<button class="button button-primary" data-action="add-book">${icon('plus', 16)} ${T.ui.forms.addBook}</button>`)}<div class="library-toolbar"><div class="library-summary"><strong>${books.length}</strong><span>${T.ui.library.titlesInCollection}</span></div><label class="search-field library-search">${icon('search', 17)}<input id="library-search" type="search" placeholder="${T.ui.library.searchPlaceholder}" value="${e(search)}"></label></div>${books.length ? `<section class="library-grid">${cards}</section>` : emptyState(T.ui.library.noBooksFound, data.books.length ? T.ui.library.tryAnotherSearch : T.ui.library.addFirstBook, data.books.length ? '' : '<button class="button button-primary" data-action="add-book">${T.ui.forms.addBook}</button>')}`;
}

export function renderWishlist(data) {
  const entries = data.readings.filter(r => r.status === T.status.wantToRead).sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || Number(a.id) - Number(b.id));
  const cards = entries.map((r, i) => { const b = byId(data.books, r.bookId) || {}; const priority = r.priority || T.common.noPriority; return `<article class="wishlist-card"><div class="wishlist-number">${String(i + 1).padStart(2, '0')}</div>${cover(b, i, true)}<div class="wishlist-content"><div class="wishlist-tags"><span class="priority-label ${priority === T.common.noPriority ? 'priority-none' : `priority-${priority.toLowerCase()}`}">${e(priority)} ${T.ui.wishlist.priority}</span>${b.form ? `<span>${e(b.form)}</span>` : ''}</div><h3>${e(b.title || T.common.unknownBook)}</h3><p>${e(authorNames(b, data.authors))}</p><div class="wishlist-extra"><span>${T.ui.wishlist.recommendedBy}</span><strong>${e(r.recommendedBy || T.common.notSpecified)}</strong></div></div><div class="wishlist-actions"><button class="button button-secondary button-small" data-action="edit-reading" data-id="${r.id}">${icon('edit', 14)} ${T.ui.wishlist.editEntry}</button><button class="icon-button subtle danger-hover" data-action="delete-reading" data-id="${r.id}" aria-label="${T.ui.log.deleteReading}">${icon('trash', 15)}</button></div></article>` }).join('');
  return `${pageHeader(T.sections.wishlistEyebrow, `${T.ui.wishlist.title}<span class="heading-period">.</span>`, T.ui.wishlist.description, `<button class="button button-primary" data-action="add-wishlist">${icon('plus', 16)} ${T.ui.wishlist.addToWishlist}</button>`)}<div class="wishlist-intro"><div><span class="eyebrow">${T.ui.wishlist.readingQueue}</span><strong>${entries.length} <small>${T.ui.wishlist.booksWaiting}</small></strong></div><div class="priority-legend"><span><i class="priority-high"></i> ${T.ui.wishlist.high}</span><span><i class="priority-medium"></i> ${T.ui.wishlist.medium}</span><span><i class="priority-low"></i> ${T.ui.wishlist.low}</span></div></div>${entries.length ? `<section class="wishlist-list">${cards}</section>` : emptyState(T.ui.wishlist.emptyTitle, T.ui.wishlist.emptyDescription, '<button class="button button-primary" data-action="add-wishlist">${T.ui.wishlist.addFirstBook}</button>')}`;
}

export function renderAuthors(data, search = '') {
  const term = search.toLocaleLowerCase('en-US');
  const authors = [...data.authors].filter(a => `${a.name} ${byId(data.countries, a.countryId)?.name || ''}`.toLocaleLowerCase('en-US').includes(term)).sort((a, b) => a.name.localeCompare(b.name));
  const cards = authors.map(a => { const books = data.books.filter(b => (b.authorIds || []).some(id => Number(id) === Number(a.id))); const readBooks = books.filter(b => data.readings.some(r => Number(r.bookId) === Number(b.id) && r.status === T.status.read)); const country = byId(data.countries, a.countryId)?.name || T.common.unknownNationality; return `<article class="author-card"><div class="author-avatar">${e(initials(a.name))}</div><div class="author-info"><h3>${e(a.name)}</h3><span>${e(country)}</span><div class="author-stats"><span>${books.length} ${books.length === 1 ? T.common.book : T.common.books}</span><span>${readBooks.length} ${T.ui.library.completed}</span></div></div><div class="author-card-actions"><button class="icon-button subtle" data-action="edit-author" data-id="${a.id}" aria-label="${T.ui.forms.editAuthor}">${icon('edit', 15)}</button><button class="icon-button subtle danger-hover" data-action="delete-author" data-id="${a.id}" aria-label="${T.ui.authors.deleteAuthor}">${icon('trash', 15)}</button></div></article>` }).join('');
  return `${pageHeader(T.sections.authorsEyebrow, `${T.ui.authors.title}<span class="heading-period">.</span>`, T.ui.authors.description, `<button class="button button-primary" data-action="add-author">${icon('plus', 16)} ${T.ui.authors.addAuthor}</button>`)}<div class="library-toolbar"><div class="library-summary"><strong>${authors.length}</strong><span>${T.ui.authors.authorsInDirectory}</span></div><label class="search-field library-search">${icon('search', 17)}<input id="author-search" type="search" placeholder="${T.ui.authors.searchPlaceholder}" value="${e(search)}"></label></div>${authors.length ? `<section class="authors-grid">${cards}</section>` : emptyState(T.ui.authors.noAuthorsFound, T.ui.authors.tryAnotherSearch, '<button class="button button-primary" data-action="add-author">${T.ui.authors.addAuthor}</button>')}`;
}

function groupBy(list, keyFn) {
  return list.reduce((groups, item) => { const key = keyFn(item); (groups[key] ||= []).push(item); return groups; }, {});
}
function authorAge(author) {
  if (!author.birthDate) return null;
  const birth = new Date(`${author.birthDate}T00:00:00`);
  const end = author.deathDate ? new Date(`${author.deathDate}T00:00:00`) : new Date();
  if (Number.isNaN(birth.getTime()) || Number.isNaN(end.getTime())) return null;
  let age = end.getFullYear() - birth.getFullYear();
  if (end.getMonth() < birth.getMonth() || (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

// Estatísticas são calculadas a partir dos registros de leitura, sem alterar os dados salvos.
export function renderInsights(data) {
  const completed = data.readings.filter(r => r.status === T.status.read);
  const grades = data.readings.filter(r => r.grade != null);
  const readByYear = groupBy(completed.filter(r => r.yearRead != null), r => Number(r.yearRead));
  const gradeByYear = groupBy(grades.filter(r => r.yearRead != null), r => Number(r.yearRead));
  const years = unique([...Object.keys(readByYear), ...Object.keys(gradeByYear)]).sort((a, b) => Number(a) - Number(b));
  const nationalityGroups = {};
  for (const reading of grades) {
    const book = byId(data.books, reading.bookId);
    const linkedAuthors = (book?.authorIds || []).map(id => byId(data.authors, id)).filter(Boolean);
    // Livros sem autores ficam fora desta comparação; cada país conta uma vez por leitura.
    const countriesForReading = unique(linkedAuthors.map(author => byId(data.countries, author.countryId)?.name || T.common.unknown));
    for (const country of countriesForReading) (nationalityGroups[country] ||= []).push(reading);
  }
  const nationalityStats = Object.entries(nationalityGroups).map(([name, items]) => ({ name, avg: average(items.map(r => r.grade)), count: items.length })).sort((a, b) => b.avg - a.avg);
  const formGroups = groupBy(grades, r => byId(data.books, r.bookId)?.form || T.common.unknown);
  const formStats = Object.entries(formGroups).map(([name, items]) => ({ name, avg: average(items.map(r => r.grade)), count: items.length })).sort((a, b) => b.avg - a.avg);
  const topByBook = {};
  for (const reading of grades) (topByBook[reading.bookId] ||= []).push(Number(reading.grade));
  const top = Object.entries(topByBook).map(([bookId, values]) => ({ bookId: Number(bookId), grade: average(values) })).sort((a, b) => b.grade - a.grade).slice(0, 10);
  const centuries = groupBy(data.books, b => centuryLabel(b.publicationYear));
  Object.values(centuries).forEach(group => group.sort((a, b) => {
    if (a.publicationYear == null) return b.publicationYear == null ? a.title.localeCompare(b.title) : 1;
    if (b.publicationYear == null) return -1;
    return Number(a.publicationYear) - Number(b.publicationYear);
  }));
  const centuryOrder = Object.keys(centuries).sort((a, b) => {
    if (a === T.common.unknownCentury) return 1; if (b === T.common.unknownCentury) return -1;
    const na = parseInt(a, 10), nb = parseInt(b, 10); const aBC = a.includes('BC'), bBC = b.includes('BC'); if (aBC !== bBC) return aBC ? -1 : 1; return aBC ? nb - na : na - nb;
  });
  const nationalityAuthors = groupBy(data.authors, a => byId(data.countries, a.countryId)?.name || T.common.unknown);
  const authorGroups = Object.entries(nationalityAuthors).sort((a, b) => a[0].localeCompare(b[0]));
  return `${pageHeader(T.sections.insightsEyebrow, `${T.ui.insights.title}<span class="heading-period">.</span>`, T.ui.insights.description)}
    <section class="insight-stat-grid">${statCard(T.ui.insights.completedRecords, completed.length, T.ui.insights.statusRead, 'green', 'book')}${statCard(T.ui.insights.gradedRecords, grades.length, T.ui.insights.includedInAverages, 'violet', 'spark')}${statCard(T.ui.overview.averageGrade, average(grades.map(r => r.grade))?.toFixed(2) ?? '—', T.ui.insights.allGraded, 'blue', 'insights')}</section>
    <section class="insight-chart-grid"><article class="panel chart-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.render.insightRequirements}</div><h3>${T.ui.insights.booksPerYear}</h3><p>${T.ui.insights.completedRecordsCount}</p></div></div><div class="chart-wrap"><canvas id="insight-count-chart" aria-label="${T.ui.insights.booksPerYear}"></canvas></div></article><article class="panel chart-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.render.insightRequirements}</div><h3>${T.ui.insights.averagePerYear}</h3><p>${T.ui.insights.onlyGradedIncluded}</p></div></div><div class="chart-wrap"><canvas id="insight-grade-chart" aria-label="${T.ui.insights.averagePerYear}"></canvas></div></article></section>
    <section class="insight-table-grid"><article class="panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.insights.gradeDistribution}</div><h3>${T.ui.insights.byNationality}</h3><p>${T.ui.insights.nationalityRule}</p></div></div>${nationalityStats.length ? `<div class="rank-table">${nationalityStats.map(s => `<div class="rank-row"><span>${e(s.name)}</span><div class="rank-bar"><i class="rank-fill rank-${Math.max(0, Math.min(100, Math.round(s.avg * 2) * 5))}"></i></div><strong>${s.avg.toFixed(2)}</strong><small>${s.count}</small></div>`).join('')}</div>` : `<p class="muted-copy">${T.ui.insights.noGraded}</p>`}</article><article class="panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.insights.gradeDistribution}</div><h3>${T.ui.insights.byForm}</h3><p>${T.ui.insights.onlyGraded}</p></div></div>${formStats.length ? `<div class="rank-table">${formStats.map(s => `<div class="rank-row"><span>${e(s.name)}</span><div class="rank-bar"><i class="rank-fill rank-${Math.max(0, Math.min(100, Math.round(s.avg * 2) * 5))}"></i></div><strong>${s.avg.toFixed(2)}</strong><small>${s.count}</small></div>`).join('')}</div>` : `<p class="muted-copy">${T.ui.insights.noGraded}</p>`}</article></section>
    <section class="panel top-books-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.overview.hallOfFame}</div><h3>${T.ui.insights.topTen}</h3><p>${T.ui.insights.rankedByGrade}</p></div></div>${top.length ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>${T.ui.insights.rank}</th><th>${T.ui.log.bookColumn}</th><th>${T.ui.log.authorColumn}</th><th>${T.ui.insights.originalYear}</th><th>${T.ui.insights.averageGradeColumn}</th></tr></thead><tbody>${top.map((r, i) => { const b = byId(data.books, r.bookId) || {}; return `<tr><td><span class="rank-token">${String(i + 1).padStart(2, '0')}</span></td><td><strong>${e(b.title || T.common.unknownBook)}</strong></td><td>${e(authorNames(b, data.authors))}</td><td>${e(formatYear(b.publicationYear))}</td><td><span class="grade-value">${e(formatGrade(r.grade))}</span></td></tr>` }).join('')}</tbody></table></div>` : emptyState(T.ui.insights.noGradedBooks, T.ui.insights.gradesAppear)}</section>
    <section class="panel century-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.insights.optionalCentury}</div><h3>${T.ui.insights.booksByCentury}</h3><p>${T.ui.insights.centuryDescription}</p></div></div><div class="century-grid">${centuryOrder.map(label => `<div class="century-group"><strong>${e(label)}</strong><span>${centuries[label].length} ${T.ui.insights.titleCount}</span><small>${centuries[label].slice(0, 3).map(b => e(b.title)).join(' · ')}${centuries[label].length > 3 ? ' · …' : ''}</small></div>`).join('')}</div></section>
    <section class="panel nationality-panel"><div class="panel-heading"><div><div class="eyebrow">${T.ui.insights.optionalNationality}</div><h3>${T.ui.insights.authorsByNationality}</h3><p>${T.ui.insights.completedReadingsShown}</p></div></div><div class="nationality-groups">${authorGroups.map(([country, authors]) => `<details class="nationality-group"><summary><span>${e(country)}</span><small>${authors.length} ${T.ui.insights.authorCount}</small></summary><div class="nationality-author-grid">${authors.map(a => { const books = data.books.filter(b => (b.authorIds || []).some(id => Number(id) === Number(a.id)) && data.readings.some(r => Number(r.bookId) === Number(b.id) && r.status === T.status.read)); const age = authorAge(a); return `<div><strong>${e(a.name)}</strong><small>${e(a.birthDate || T.common.dash)} – ${e(a.deathDate || T.common.dash)} · ${age == null ? T.ui.insights.ageUnknown : `${age} ${T.ui.insights.years}`}</small><small>${books.length ? books.map(b => e(b.title)).join(', ') : T.ui.insights.noCompletedBooks}</small></div>` }).join('')}</div></details>`).join('')}</div></section>`;
}

export function renderPage(view, data, state) {
  if (view === 'overview') return renderOverview(data);
  if (view === 'log') return renderLog(data, state);
  if (view === 'library') return renderLibrary(data, state.searches.library || '');
  if (view === 'wishlist') return renderWishlist(data);
  if (view === 'authors') return renderAuthors(data, state.searches.authors || '');
  if (view === 'insights') return renderInsights(data);
  return renderOverview(data);
}

const field = (label, name, control, required = false, hint = '') => `<label class="form-field"><span class="field-label">${e(label)}${required ? '<i>*</i>' : ''}</span>${control}${hint ? `<small class="field-hint">${e(hint)}</small>` : ''}<small class="field-error" data-error-for="${name}"></small></label>`;
const textInput = (name, value = '', type = 'text', placeholder = '') => { const numeric = type === 'number' ? (name.toLowerCase().includes('grade') ? ' min="0" max="10" step="0.5"' : ' step="1"') : ''; return `<input id="field-${name}" name="${name}" type="${type}"${numeric} value="${e(value ?? '')}" placeholder="${e(placeholder)}" autocomplete="off">`; };
const selectInput = (name, options, selected, empty = T.ui.forms.choose) => `<select id="field-${name}" name="${name}"><option value="">${e(empty)}</option>${options.map(v => { const value = typeof v === 'object' ? v.value : v; const label = typeof v === 'object' ? v.label : v; return `<option value="${e(value)}" ${String(selected ?? '') === String(value) ? 'selected' : ''}>${e(label)}</option>` }).join('')}</select>`;

export function renderAuthorModal(author, data) {
  const editing = Boolean(author);
  const record = author || { name: '', countryId: '', birthDate: '', deathDate: '' };
  return modalShell(editing ? T.ui.forms.editAuthor : T.ui.forms.addAuthor, T.ui.forms.authorDescription, `<form data-form="author" data-id="${record.id || ''}" novalidate><div class="form-grid">${field(T.ui.forms.authorName, 'name', textInput('name', record.name, 'text', T.ui.forms.fullName), true)}${field(T.common.country, 'countryId', selectInput('countryId', [...data.countries].sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ value: c.id, label: c.name })), record.countryId, T.ui.forms.noNationality))}${field(T.common.dateOfBirth, 'birthDate', textInput('birthDate', record.birthDate, 'date'))}${field(T.common.dateOfDeath, 'deathDate', textInput('deathDate', record.deathDate, 'date'))}</div><div class="form-footer"><span class="required-note">${T.ui.forms.requiredField}</span><div><button class="button button-secondary" type="button" data-action="close-modal">${T.common.cancel}</button><button class="button button-primary" type="submit">${editing ? T.ui.forms.saveAuthor : T.ui.forms.createAuthor}</button></div></div></form>`);
}

export function renderBookModal(book, data) {
  const editing = Boolean(book);
  const record = book || { title: '', authorIds: [], publicationYear: '', form: '', mode: '', content: '', themeIds: [] };
  const authors = [...data.authors].sort((a, b) => a.name.localeCompare(b.name));
  const themes = [...data.themes].sort((a, b) => a.name.localeCompare(b.name));
  const authorChecks = authors.map(a => `<label class="check-option"><input type="checkbox" name="authorIds" value="${a.id}" ${(record.authorIds || []).some(id => Number(id) === Number(a.id)) ? 'checked' : ''}><span>${e(a.name)}</span></label>`).join('');
  const themeChecks = themes.map(t => `<label class="check-option"><input type="checkbox" name="themeIds" value="${t.id}" ${(record.themeIds || []).some(id => Number(id) === Number(t.id)) ? 'checked' : ''}><span>${e(t.name)}</span></label>`).join('');
  const initialRead = record.initialReading;
  return modalShell(editing ? T.ui.forms.editBook : T.ui.forms.addBook, editing ? T.ui.forms.updateBookDescription : T.ui.forms.newBookDescription, `<form data-form="book" data-id="${record.id || ''}" novalidate><div class="modal-section-title">${T.ui.forms.bookDetails}</div><div class="form-grid">${field(T.common.title, 'title', textInput('title', record.title, 'text', T.ui.forms.bookTitle), true)}${field(T.ui.forms.originalPublicationYear, 'publicationYear', textInput('publicationYear', record.publicationYear, 'number', T.ui.forms.publicationYearExample), '', T.ui.forms.publicationYearHint)}${field(T.common.form, 'form', selectInput('form', T.forms, record.form, T.ui.forms.chooseForm))}${field(T.ui.forms.modeOfExpression, 'mode', selectInput('mode', T.modes, record.mode, T.ui.forms.chooseMode))}${field(T.common.content, 'content', selectInput('content', T.contents, record.content, T.ui.forms.chooseContent))}</div><div class="modal-section-title spaced-title">${T.ui.forms.authors} <span>${T.ui.forms.selectExistingAuthors}</span></div><div class="choice-box"><div class="choice-grid">${authorChecks || `<span class="muted-copy">${T.ui.forms.noAuthorsAvailable}</span>`}</div></div><small class="field-error" data-error-for="authorIds"></small><div class="modal-section-title spaced-title">${T.ui.forms.themes} <span>${T.ui.forms.selectOrCreate}</span></div><div class="choice-box"><div class="choice-grid theme-choices">${themeChecks}</div><div class="new-theme-row"><input name="newTheme" type="text" placeholder="${T.ui.forms.createTheme}" maxlength="60"><span>${T.ui.forms.addedWhenSaved}</span></div></div><small class="field-error" data-error-for="themeIds"></small>${!editing ? `<div class="first-reading-box"><label class="first-reading-toggle"><input type="checkbox" name="addFirstReading" id="add-first-reading" ${initialRead ? 'checked' : ''}><span><strong>${T.ui.forms.addFirstReading}</strong><small>${T.ui.forms.firstReadingDescription}</small></span><i class="toggle-ui"></i></label><div class="first-reading-fields ${initialRead ? 'open' : ''}" id="first-reading-fields"><div class="form-grid">${field(T.common.status, 'initialStatus', selectInput('initialStatus', T.statusValues, initialRead?.status || T.status.wantToRead))}${field(T.common.priority, 'initialPriority', selectInput('initialPriority', T.priorities, initialRead?.priority || T.priority.medium, T.common.noPriority))}${field(T.common.yearRead, 'initialYearRead', textInput('initialYearRead', initialRead?.yearRead, 'number', T.ui.forms.yearPlaceholder))}${field(T.common.grade, 'initialGrade', textInput('initialGrade', initialRead?.grade, 'number', T.ui.forms.gradePlaceholder))}${field(T.common.recommendedBy, 'initialRecommendedBy', textInput('initialRecommendedBy', initialRead?.recommendedBy, 'text', T.ui.forms.name))}</div><label class="form-field full-field"><span class="field-label">${T.common.notes}</span><textarea name="initialNotes" rows="2" placeholder="${T.ui.forms.optionalNotes}">${e(initialRead?.notes || '')}</textarea></label><div class="first-reading-note">${T.ui.forms.firstReadingRule}</div></div></div>` : ''}<div class="form-footer"><span class="required-note">${T.ui.forms.requiredField}</span><div><button class="button button-secondary" type="button" data-action="close-modal">${T.common.cancel}</button><button class="button button-primary" type="submit">${editing ? T.ui.forms.saveBook : T.ui.overview.addToLibrary}</button></div></div></form>`);
}

export function renderReadingModal(reading, data) {
  const editing = Boolean(reading);
  const record = reading || { bookId: '', status: T.status.wantToRead, yearRead: '', grade: '', recommendedBy: '', priority: T.priority.medium, notes: '' };
  const books = [...data.books].sort((a, b) => a.title.localeCompare(b.title));
  return modalShell(editing ? T.ui.forms.editReading : T.ui.overview.logReading, T.ui.forms.readingDescription, `<form data-form="reading" data-id="${record.id || ''}" novalidate><div class="form-grid">${field(T.common.book, 'bookId', selectInput('bookId', books.map(b => ({ value: b.id, label: b.title })), record.bookId, T.ui.forms.chooseBook), true)}${field(T.common.status, 'status', selectInput('status', T.statusValues, record.status), true)}${field(T.common.yearRead, 'yearRead', textInput('yearRead', record.yearRead, 'number', T.ui.forms.yearPlaceholder), '', T.ui.forms.requiredForRead)}${field(T.common.grade, 'grade', textInput('grade', record.grade, 'number', T.ui.forms.gradePlaceholder), '', T.ui.forms.gradeRange)}${field(T.common.priority, 'priority', selectInput('priority', T.priorities, record.priority, T.common.noPriority), '', T.ui.forms.priorityOnlyForWishlist)}${field(T.common.recommendedBy, 'recommendedBy', textInput('recommendedBy', record.recommendedBy, 'text', T.ui.forms.recommendedPerson))}</div><label class="form-field full-field"><span class="field-label">${T.common.notes}</span><textarea name="notes" rows="4" placeholder="${T.ui.forms.readingNotes}">${e(record.notes || '')}</textarea></label><div class="form-footer"><span class="required-note">${T.ui.forms.requiredField}</span><div><button class="button button-secondary" type="button" data-action="close-modal">${T.common.cancel}</button><button class="button button-primary" type="submit">${editing ? T.ui.forms.saveReading : T.ui.forms.saveReading}</button></div></div></form>`);
}

function modalShell(title, description, body) {
  return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><div class="eyebrow">${T.ui.shell.libraryManagement}</div><h2 id="modal-title">${e(title)}</h2><p>${e(description)}</p></div><button class="icon-button modal-close" type="button" data-action="close-modal" aria-label="${T.ui.forms.closeDialog}">${icon('close', 20)}</button></header><div class="modal-body">${body}</div></section></div>`;
}

export function showModal(html) { document.getElementById('modal-root').innerHTML = html; document.body.classList.add('modal-open'); const first = document.querySelector('#modal-root input:not([type=checkbox]), #modal-root select'); first?.focus(); }
export function closeModal() { document.getElementById('modal-root').innerHTML = ''; document.body.classList.remove('modal-open'); }
export function showToast(message, tone = 'success') { const root = document.getElementById('toast-root'); const node = document.createElement('div'); node.className = `toast toast-${tone}`; node.textContent = message; root.append(node); window.setTimeout(() => node.remove(), 3600); }
export function showFormErrors(form, errors) {
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('.invalid-field').forEach(el => el.classList.remove('invalid-field'));
  for (const [name, message] of Object.entries(errors)) {
    const target = form.querySelector(`[data-error-for="${name}"]`); if (target) target.textContent = message;
    const input = form.querySelector(`[name="${name}"]`); if (input) input.classList.add('invalid-field');
  }
}

export function destroyCharts(charts) { for (const key of Object.keys(charts)) { charts[key]?.destroy(); delete charts[key]; } }
function renderChartFallback(canvasId, labels, values, tone = 'violet') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const max = Math.max(1, ...values.filter(value => value != null).map(Number));
  const columns = labels.map((label, index) => {
    const value = values[index] == null ? 0 : Number(values[index]);
    const height = Math.max(value > 0 ? 6 : 0, Math.min(100, Math.round(value / max * 100 / 10) * 10));
    return `<div class="fallback-column"><div class="fallback-track"><i class="fallback-bar ${tone} h-${height}"></i></div><strong>${value ? (Number.isInteger(value) ? value : value.toFixed(1)) : '—'}</strong><small>${e(label)}</small></div>`;
  }).join('');
  canvas.parentElement.innerHTML = `<div class="fallback-chart" role="img" aria-label="${e(labels.join(', '))}">${columns}</div>`;
}

export function makeCharts(view, data, charts) {
  destroyCharts(charts);
  if (!window.Chart) {
    if (view === 'overview' || view === 'insights') {
      const completed = data.readings.filter(r => r.status === T.status.read && r.yearRead != null);
      const graded = data.readings.filter(r => r.grade != null && r.yearRead != null);
      const readGroups = completed.reduce((acc, r) => { const y = Number(r.yearRead); (acc[y] ||= []).push(r); return acc; }, {});
      const gradeGroups = graded.reduce((acc, r) => { const y = Number(r.yearRead); (acc[y] ||= []).push(r); return acc; }, {});
      const readYears = Object.keys(readGroups).sort((a, b) => Number(a) - Number(b));
      const allYears = unique([...readYears, ...Object.keys(gradeGroups)]).sort((a, b) => Number(a) - Number(b));
      if (view === 'overview') renderChartFallback('overview-year-chart', readYears, readYears.map(y => readGroups[y].length), 'violet');
      if (view === 'insights') {
        renderChartFallback('insight-count-chart', readYears, readYears.map(y => readGroups[y].length), 'violet');
        renderChartFallback('insight-grade-chart', allYears, allYears.map(y => { const items = gradeGroups[y] || []; return items.length ? items.reduce((sum, r) => sum + Number(r.grade), 0) / items.length : null; }), 'cyan');
      }
    }
    return;
  }
  const base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2030', titleColor: '#fff', bodyColor: '#cbd1df', padding: 12, displayColors: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8e96aa', font: { family: 'DM Sans', size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.10)' }, ticks: { color: '#8e96aa', font: { family: 'DM Sans', size: 11 }, precision: 0 } } } };
  if (view === 'overview') {
    const completed = data.readings.filter(r => r.status === T.status.read && r.yearRead != null); const groups = completed.reduce((acc, r) => { acc[r.yearRead] = (acc[r.yearRead] || 0) + 1; return acc; }, {}); const years = Object.keys(groups).sort((a, b) => Number(a) - Number(b));
    const ctx = document.getElementById('overview-year-chart'); if (ctx) charts.overview = new Chart(ctx, { type: 'bar', data: { labels: years, datasets: [{ data: years.map(y => groups[y]), backgroundColor: 'rgba(167,139,250,.75)', hoverBackgroundColor: '#c4b5fd', borderRadius: 7, maxBarThickness: 34 }] }, options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMax: Math.max(5, ...years.map(y => groups[y])) + 2 } } } });
  }
  if (view === 'insights') {
    const completed = data.readings.filter(r => r.status === T.status.read && r.yearRead != null);
    const graded = data.readings.filter(r => r.grade != null && r.yearRead != null);
    const readGroups = completed.reduce((acc, r) => { const y = Number(r.yearRead); (acc[y] ||= []).push(r); return acc; }, {});
    const gradeGroups = graded.reduce((acc, r) => { const y = Number(r.yearRead); (acc[y] ||= []).push(r); return acc; }, {});
    const readYears = Object.keys(readGroups).sort((a, b) => Number(a) - Number(b));
    const gradeYears = Object.keys(gradeGroups).sort((a, b) => Number(a) - Number(b));
    const countCtx = document.getElementById('insight-count-chart'); if (countCtx) charts.count = new Chart(countCtx, { type: 'bar', data: { labels: readYears, datasets: [{ data: readYears.map(y => readGroups[y].length), backgroundColor: 'rgba(167,139,250,.75)', hoverBackgroundColor: '#c4b5fd', borderRadius: 7, maxBarThickness: 34 }] }, options: base });
    const gradeCtx = document.getElementById('insight-grade-chart'); if (gradeCtx) { charts.grade = new Chart(gradeCtx, { type: 'line', data: { labels: gradeYears, datasets: [{ data: gradeYears.map(y => gradeGroups[y].reduce((sum, r) => sum + Number(r.grade), 0) / gradeGroups[y].length), borderColor: '#67e8f9', backgroundColor: 'rgba(103,232,249,.12)', fill: true, tension: .35, pointRadius: 4, pointHoverRadius: 6, spanGaps: false }] }, options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, min: 0, max: 10, ticks: { ...base.scales.y.ticks, stepSize: 2 } } } } }); }
  }
}
