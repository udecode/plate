/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

/* eslint-disable no-restricted-syntax */
// copy of map but without some keys
// I.e., restrict a function to the complement of a subset of the domain.
export function copyWithout(obj: any, w: string[] | string): any {
  if (typeof w === 'string') {
    w = [w];
  }

  const r: any = {};

  for (const key in obj) {
    const y = obj[key];

    if (!Array.from(w).includes(key)) {
      r[key] = y;
    }
  }

  return r;
}
