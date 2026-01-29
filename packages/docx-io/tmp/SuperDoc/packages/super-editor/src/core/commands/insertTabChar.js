//prettier-ignore
export const insertTabChar = () => ({ tr }) => {
  tr.insertText('\t', tr.selection.from, tr.selection.to);
  
  return true;
};
