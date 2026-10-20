const CANONICAL_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

export const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

export const parseCanonicalDateValue = (value: string) => {
  if (!CANONICAL_DATE_REGEX.test(value)) return undefined;

  const [yearString, monthString, dayString] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const parsed = new Date(year, month - 1, day, 12);

  if (!isValidDate(parsed)) return undefined;
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return parsed;
};
