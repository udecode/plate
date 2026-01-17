export const removeSimpleOrDoubleQuotes = /(["'])(.*?)\1/;

export type FontTableObject = {
  fontName: string;
  genericFontName: string;
};

export const fontFamilyToTableObject = (
  fontFamilyString: string | null | undefined,
  fallbackFont: string
): FontTableObject => {
  const fontFamilyElements = fontFamilyString
    ? fontFamilyString.split(',').map((fontName) => {
        const trimmedFontName = fontName.trim();
        if (removeSimpleOrDoubleQuotes.test(trimmedFontName)) {
          const match = trimmedFontName.match(removeSimpleOrDoubleQuotes);
          return match ? match[2] : trimmedFontName;
        }
        return trimmedFontName;
      })
    : [fallbackFont];

  return {
    fontName: fontFamilyElements[0],
    genericFontName: fontFamilyElements.at(-1) ?? fontFamilyElements[0],
  };
};
