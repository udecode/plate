function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (getType(value) !== 'Object') {
    return false;
  }

  return (
    value !== null &&
    (value as { constructor?: unknown }).constructor === Object &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output = { ...target };

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      output[key] =
        isPlainObject(source[key]) && isPlainObject(target[key])
          ? mergeDeep(target[key], source[key])
          : source[key];
    });
  }

  return output;
}
