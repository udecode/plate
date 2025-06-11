export const escapeRegExp = (text: string) => {
  return text.replaceAll(/[#$()*+,.?[\\\]^s{|}-]/g, String.raw`\$&`);
};
