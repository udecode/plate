export const escapeRegExp = (text: string) =>
  text.replaceAll(/[|\\{}()[\]^$+*?.-]/g, String.raw`\$&`);
