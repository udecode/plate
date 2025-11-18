export const escapeRegExp = (text: string) =>
  text.replaceAll(/[#$()*+,.?[\\\]^s{|}-]/g, String.raw`\$&`);
