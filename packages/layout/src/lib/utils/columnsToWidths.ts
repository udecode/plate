export const columnsToWidths = ({ columns = 2 }: { columns?: number } = {}) =>
  Array(columns)
    .fill(null)
    .map(() => `${100 / columns}%`);
