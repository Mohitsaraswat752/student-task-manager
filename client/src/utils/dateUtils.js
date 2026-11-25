/**
 * Date utility functions for consistent timezone-agnostic date handling across views.
 * Prevents the notorious "off-by-one day" bug caused by local vs UTC midnight rollover.
 */

export const toDateInputString = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const datePart = dateInput.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayInputString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    const datePart = dateInput.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
  }
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = parseLocalDate(dateInput);
  if (!d) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const isOverdue = (task) => {
  if (!task || !task.dueDate || task.completed) return false;
  const taskDate = parseLocalDate(task.dueDate);
  if (!taskDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today;
};

export const isDueToday = (task) => {
  if (!task || !task.dueDate) return false;
  return toDateInputString(task.dueDate) === getTodayInputString();
};
