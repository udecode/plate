const fieldEnd = /[\t\n\r]/;

// Spreadsheets write a bare field such as `"quoted"` or `6"` unquoted, so a
// quote only opens a quoted field when the field also needed quoting.
const needsQuotes = (field: string) =>
  fieldEnd.test(field) || field.startsWith('"');

export const serializeTabSeparated = (rows: ReadonlyArray<readonly string[]>) =>
  `${rows
    .map((row) =>
      row
        .map((field) =>
          needsQuotes(field) ? `"${field.replaceAll('"', '""')}"` : field
        )
        .join('\t')
    )
    .join('\n')}\n`;

const readQuotedField = (text: string, start: number) => {
  let value = '';
  let index = start + 1;

  while (index < text.length) {
    const char = text[index];

    if (char !== '"') {
      value += char;
      index += 1;
      continue;
    }
    if (text[index + 1] === '"') {
      value += '"';
      index += 2;
      continue;
    }

    const next = text[index + 1];
    const atBoundary =
      next === undefined || next === '\t' || next === '\n' || next === '\r';

    return atBoundary && needsQuotes(value) ? { end: index + 1, value } : null;
  }

  return null;
};

export const parseTabSeparated = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let index = 0;

  while (index < text.length) {
    const quoted = text[index] === '"' ? readQuotedField(text, index) : null;
    let end = quoted?.end ?? index;

    if (!quoted) {
      while (end < text.length && !fieldEnd.test(text[end])) end += 1;
    }

    row.push(quoted ? quoted.value : text.slice(index, end));

    const separator = text[end];

    if (separator === '\t') {
      index = end + 1;
      if (index === text.length) rows.push([...row, '']);
      continue;
    }

    rows.push(row);
    row = [];
    index = end + (separator === '\r' && text[end + 1] === '\n' ? 2 : 1);
  }

  return rows;
};
