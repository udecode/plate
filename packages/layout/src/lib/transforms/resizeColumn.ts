import type { TColumnGroupElement } from '../types';

export function resizeColumn(
  columnGroup: TColumnGroupElement,
  columnId: string,
  newWidthPercent: number
): TColumnGroupElement {
  // Convert widths to numbers for easier math
  const widths = columnGroup.children.map((col) =>
    col.width ? Number.parseFloat(col.width) : 0
  );

  const totalBefore = widths.reduce((sum, w) => sum + w, 0);

  // fallback if columns do not sum to 100: normalize them
  if (totalBefore === 0) {
    // distribute evenly if no widths
    const evenWidth = 100 / columnGroup.children.length;
    columnGroup.children.forEach((col) => {
      col.width = `${evenWidth}%`;
    });

    return columnGroup;
  }

  const index = columnGroup.children.findIndex((col) => col.id === columnId);

  if (index === -1) return columnGroup; // Column not found

  // Set the new width for the target column
  widths[index] = newWidthPercent;

  // Calculate the difference from total (ideally 100)
  let totalAfter = widths.reduce((sum, w) => sum + w, 0);

  // If total is off from 100%, adjust siblings
  // For simplicity, assume totalAfter < 100%. Add leftover to the next column.
  // You can make this logic more balanced if needed.
  const diff = 100 - totalAfter;

  if (diff !== 0) {
    // Find a sibling to adjust. For a simple strategy, pick the next column.
    const siblingIndex = (index + 1) % widths.length;
    widths[siblingIndex] = Math.max(widths[siblingIndex] + diff, 0);
  }

  // Normalize again if rounding introduced a small error
  totalAfter = widths.reduce((sum, w) => sum + w, 0);

  if (Math.round(totalAfter) !== 100) {
    // If you want a perfectly balanced approach:
    // Scale all widths so they sum exactly to 100
    const scale = 100 / totalAfter;

    for (let i = 0; i < widths.length; i++) {
      widths[i] = Number.parseFloat((widths[i] * scale).toFixed(2));
    }
  }

  // Update the column widths
  columnGroup.children.forEach((col, i) => {
    col.width = `${widths[i]}%`;
  });

  return columnGroup;
}
