import { isCompleteMath } from '../..';

export const escapeInput = (data: string) => {
  let res = data;

  // test case: should correctly handle inline math
  if (
    data.startsWith('$$') &&
    !data.startsWith('$$\n') &&
    !isCompleteMath(data)
  ) {
    res = data.replace('$$', String.raw`\$\$`);
  }

  return res;
};
