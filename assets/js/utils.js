import { T } from './strings.js';

export const byId = (items, id) => items.find(item => Number(item.id) === Number(id));
export const nextId = items => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const formatYear = value => value == null || value === '' ? '—' : (Number(value) < 0 ? `${Math.abs(Number(value))} BC` : String(value));
export const formatGrade = value => value == null || value === '' ? '—' : Number(value).toFixed(1);
export const initials = value => String(value || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
export const normalize = value => String(value ?? '').trim().toLocaleLowerCase('en-US');
export const unique = values => [...new Set(values)];
export const authorNames = (book, authors) => (book.authorIds || []).map(id => byId(authors, id)?.name).filter(Boolean).join(', ') || '—';
export const statusClass = status => ({
  [T.status.read]: 'read',
  [T.status.reading]: 'reading',
  [T.status.paused]: 'paused',
  [T.status.wantToRead]: 'wishlist',
  [T.status.abandoned]: 'abandoned'
}[status] || 'neutral');
export const priorityRank = priority => ({
  [T.priority.high]: 0,
  [T.priority.medium]: 1,
  [T.priority.low]: 2
}[priority] ?? 3);
export const compareMissingLast = (a, b, direction = 'asc') => {
  const missingA = a == null || a === '';
  const missingB = b == null || b === '';
  if (missingA && missingB) return 0;
  if (missingA) return 1;
  if (missingB) return -1;
  const comparison = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });
  return direction === 'desc' ? -comparison : comparison;
};
export const centuryLabel = year => {
  if (year == null || year === '' || Number(year) === 0) return T.common.unknownCentury;
  const n = Math.abs(Number(year));
  const century = Math.ceil(n / 100);
  return Number(year) < 0 ? `${century}${ordinal(century)} century BC` : `${century}${ordinal(century)} century`;
};
export const ordinal = number => {
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  return ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th');
};
export const average = values => values.length ? values.reduce((sum, value) => sum + Number(value), 0) / values.length : null;
export const yearNow = () => new Date().getFullYear();
