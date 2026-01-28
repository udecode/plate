export function isExtensionRulesEnabled(extension, enabled) {
  if (Array.isArray(enabled)) {
    return enabled.some((enabledExtension) => {
      const name = typeof enabledExtension === 'string' ? enabledExtension : enabledExtension.name;

      return name === extension.name;
    });
  }

  return enabled;
}
