export const field = (row, key) => row?.[key] ?? row?.[key.toUpperCase()];

export const toBoolean = (value) => value === true || value === 1 || value === '1';

export const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toDateTimeString = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace('.000Z', 'Z');
};
