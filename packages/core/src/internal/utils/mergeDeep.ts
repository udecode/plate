function getType(value: any): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

function isPlainObject(value: any): value is Record<string, any> {
  if (getType(value) !== 'Object') {
    return false;
  }

  return (
    value.constructor === Object &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function mergeDeep(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
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
