const CANONICAL_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const LEGACY_DATE_REGEX = /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}$/;

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseCanonicalDateValue = (value: string) => {
  if (!CANONICAL_DATE_REGEX.test(value)) return;

  const [yearString, monthString, dayString] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const parsed = new Date(year, month - 1, day, 12);

  if (!isValidDate(parsed)) return;
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return;
  }

  return parsed;
};

export const normalizeDateValue = (value?: Date | string) => {
  if (value instanceof Date) {
    if (!isValidDate(value)) return {};

    return { date: formatDateValue(value) };
  }

  if (!value) return {};

  const trimmed = value.trim();

  if (!trimmed) return {};

  if (CANONICAL_DATE_REGEX.test(trimmed)) {
    if (parseCanonicalDateValue(trimmed)) {
      return { date: trimmed };
    }

    return { rawDate: trimmed };
  }

  if (LEGACY_DATE_REGEX.test(trimmed)) {
    const parsed = new Date(trimmed);

    if (isValidDate(parsed)) {
      return { date: formatDateValue(parsed) };
    }
  }

  return { rawDate: trimmed };
};

const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getDateDisplayLabel = ({
  date,
  now = new Date(),
  rawDate,
}: {
  date?: string;
  now?: Date;
  rawDate?: string;
}) => {
  if (rawDate) return rawDate;
  if (!date) return;

  const parsed = parseCanonicalDateValue(date);

  if (!parsed) return rawDate ?? date;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameCalendarDay(parsed, today)) return 'Today';
  if (isSameCalendarDay(parsed, yesterday)) return 'Yesterday';
  if (isSameCalendarDay(parsed, tomorrow)) return 'Tomorrow';

  return parsed.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
