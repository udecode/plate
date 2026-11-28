/** How many palette slots the authored review palette paints. */
export const AUTHORED_COLOR_COUNT = 7;

/**
 * The palette slot of a suggestion author: a hash of their id, so every peer
 * and every reload paints one author's changes alike, whatever card holds
 * them. Two authors share a slot once in `count`.
 */
export const suggestionColorOf = (
  authorId: string,
  count = AUTHORED_COLOR_COUNT
) => {
  let value = 0x81_1c_9d_c5;

  for (let index = 0; index < authorId.length; index += 1) {
    value = Math.imul(value ^ authorId.charCodeAt(index), 0x01_00_01_93) >>> 0;
  }

  return value % count;
};
