export const columnsToWidths = ({ columns = 2 }: { columns?: number } = {}) =>
  new Array(columns).fill(null).map(() => `${100 / columns}%`);
