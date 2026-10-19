/** How many palette slots the copied suggestion kit paints. */
export const SUGGESTION_COLOR_COUNT = 7;

/**
 * The palette slot of a review card: a hash of its id, so every peer and
 * every reload paints one card alike. Two cards share a slot once in `count`.
 */
export const suggestionColorOf = (
  cardId: string,
  count = SUGGESTION_COLOR_COUNT
) => {
  let value = 0x81_1c_9d_c5;

  for (let index = 0; index < cardId.length; index += 1) {
    value = Math.imul(value ^ cardId.charCodeAt(index), 0x01_00_01_93) >>> 0;
  }

  return value % count;
};
