/**
 * If "value" is a function, then call it and return result.
 * Otherwise it is returned directly.
 * @param value Any value or function.
 * @param context Context to bind to function (Optional).
 * @param props Props for function (Optional).
 */
export function callOrGet(value, context = null, ...props) {
  if (typeof value === 'function') {
    if (context) return value.bind(context)(...props);
    return value(...props);
  }

  return value;
}
