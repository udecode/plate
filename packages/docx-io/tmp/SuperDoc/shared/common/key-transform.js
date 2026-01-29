export const snakeCase = (str) => str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
export const kebabCase = (str) => str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const camelize = (str) =>
  str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^([A-Z])/, (match) => match.toLowerCase());

export const camelizeKeys = (link_comments) => {
  return link_comments.map((comment) =>
    Object.keys(comment).reduce((camelized, key) => {
      camelized[camelize(key)] = comment[key];
      return camelized;
    }, {}),
  );
};

export const snakeCaseKeys = (comments) => {
  return comments.map((comment) =>
    Object.keys(comment).reduce((snaked, key) => {
      snaked[snakeCase(key)] = comment[key];
      return snaked;
    }, {}),
  );
};

export const toKebabCase = (str) => {
  return kebabCase(str);
};
