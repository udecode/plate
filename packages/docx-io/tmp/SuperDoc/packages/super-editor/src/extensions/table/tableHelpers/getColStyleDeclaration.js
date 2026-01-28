export const getColStyleDeclaration = (minWidth, width) => {
  if (width) {
    // Apply the stored width unless it is below the configured minimum cell width.
    return ['width', `${Math.max(width, minWidth)}px`];
  }
  // Set the minimum with on the column if it has no stored width.
  return ['min-width', `${minWidth}px`];
};
