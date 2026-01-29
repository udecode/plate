/**
 * Delete a property or an array of properties from an object.
 * @param obj Object
 * @param propOrProps Key or array of keys to remove.
 */
export function deleteProps(obj, propOrProps) {
  const isString = typeof propOrProps === 'string';
  const props = isString ? [propOrProps] : propOrProps;

  return Object.keys(obj).reduce((newObj, prop) => {
    const contains = props.includes(prop);
    if (!contains) newObj[prop] = obj[prop];
    return newObj;
  }, {});
}
