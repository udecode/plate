let stripWhitespace = true;

/**
 * StripWhitespace Option
 */

export const setStripWhitespace = (isStripWhitespace: boolean) => {
  stripWhitespace = isStripWhitespace;
}

export const getStripWhitespace = () => {
  return stripWhitespace;
}
