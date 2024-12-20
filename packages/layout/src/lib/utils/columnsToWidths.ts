export const columnsToWidths = ({ columns = 2 }: { columns?: number } = {}) =>
  Array(columns)
    .fill(null)
    .map((_, i) => `${100 / columns}%`);
