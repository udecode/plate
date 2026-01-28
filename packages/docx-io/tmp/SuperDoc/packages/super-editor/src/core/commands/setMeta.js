//prettier-ignore
export const setMeta = (key, value) => ({ tr }) => {
  tr.setMeta(key, value);
  return true;
};
