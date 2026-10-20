const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const TO_DATE_STRING_REGEX =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{2}) (\d{4})$/;

/** The day is checked in UTC, so a day the host zone skipped still converts. */
export const parseLegacyDateValue = (text: string) => {
  const match = TO_DATE_STRING_REGEX.exec(text.trim());

  if (!match) return undefined;

  const [, weekday, monthName, dayText, yearText] = match;
  const year = Number(yearText);
  const month = MONTHS.indexOf(monthName);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day ||
    WEEKDAYS[date.getUTCDay()] !== weekday
  ) {
    return undefined;
  }

  return `${yearText}-${String(month + 1).padStart(2, '0')}-${dayText}`;
};
