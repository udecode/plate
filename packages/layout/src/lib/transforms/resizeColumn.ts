type ResizableColumnGroup = {
  children: { id?: string; width?: string }[];
};

export function resizeColumn<TColumnGroup extends ResizableColumnGroup>(
  columnGroup: TColumnGroup,
  columnId: string,
  newWidthPercent: number
): TColumnGroup {
  const widths = columnGroup.children.map((col) =>
    col.width ? Number.parseFloat(col.width) : 0
  );

  const totalBefore = widths.reduce((sum, w) => sum + w, 0);

  if (totalBefore === 0) {
    const evenWidth = 100 / columnGroup.children.length;
    columnGroup.children.forEach((col) => {
      col.width = `${evenWidth}%`;
    });

    return columnGroup;
  }

  const index = columnGroup.children.findIndex((col) => col.id === columnId);

  if (index === -1) return columnGroup;

  widths[index] = newWidthPercent;

  let totalAfter = widths.reduce((sum, w) => sum + w, 0);
  const diff = 100 - totalAfter;

  if (diff !== 0) {
    const siblingIndex = (index + 1) % widths.length;
    widths[siblingIndex] = Math.max(widths[siblingIndex] + diff, 0);
  }

  totalAfter = widths.reduce((sum, w) => sum + w, 0);

  if (Math.round(totalAfter) !== 100) {
    const scale = 100 / totalAfter;

    for (let i = 0; i < widths.length; i++) {
      widths[i] = Number.parseFloat((widths[i] * scale).toFixed(2));
    }
  }

  columnGroup.children.forEach((col, i) => {
    col.width = `${widths[i]}%`;
  });

  return columnGroup;
}
