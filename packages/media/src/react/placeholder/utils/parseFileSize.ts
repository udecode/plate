/** Convert string like 1B to 1024 number */
export const parseFileSize = (size: string): number => {
  const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i.exec(size);

  if (!match) {
    throw new Error('Invalid file size format');
  }

  const [, value, unit] = match;
  const sizes = { B: 0, GB: 3, KB: 1, MB: 2 };
  const k = 1024;

  return Math.floor(
    Number.parseFloat(value) *
      Math.pow(k, sizes[unit.toUpperCase() as keyof typeof sizes])
  );
};
