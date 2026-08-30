function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function deepEqual(x: unknown, y: unknown): boolean {
  if (!isRecord(x) || !isRecord(y)) return x === y;

  const keys = Object.keys(x);

  return (
    keys.length === Object.keys(y).length &&
    keys.every((key) => key in y && deepEqual(x[key], y[key]))
  );
}
