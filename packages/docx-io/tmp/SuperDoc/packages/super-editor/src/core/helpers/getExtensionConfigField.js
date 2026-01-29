/**
 * Get extension config field.
 * @param {*} extension The Editor extension.
 * @param {*} field The config field.
 * @param {*} context The context object to bind to function.
 * @returns The config field value.
 */
export function getExtensionConfigField(extension, field, context = {}) {
  if (typeof extension.config[field] === 'function') {
    const value = extension.config[field].bind({ ...context });
    return value;
  }

  return extension.config[field];
}
