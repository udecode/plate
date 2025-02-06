export type GetNextWord = (options: { text: string }) => {
  firstWord: string;
  remainingText: string;
};

export const getNextWord: GetNextWord = ({ text }) => {
  if (!text) return { firstWord: '', remainingText: '' };

  // Check if the first non-space character is a CJK character
  const nonSpaceMatch = /^\s*(\S)/.exec(text);

  if (!nonSpaceMatch) return { firstWord: '', remainingText: '' };

  const firstNonSpaceChar = nonSpaceMatch[1];

  // Regular expression for matching CJK characters
  // 1. [\u4E00-\u9FA5] - Chinese Characters
  // 2. [\u3040-\u309F] - Japanese Hiragana
  // 3. [\u30A0-\u30FF] - Japanese Katakana
  // 4. [\u3400-\u4DBF] - CJK Extension A
  // 5. [\u4E00-\u9FFF] - CJK Unified Ideographs
  // 6. [\uF900-\uFAFF] - CJK Compatibility Ideographs
  // 7. [\uAC00-\uD7AF] - Korean Syllables
  // 8. [\u1100-\u11FF] - Korean Jamo
  const isCJKChar =
    /[\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test(
      firstNonSpaceChar
    );

  let firstWord, remainingText;

  if (isCJKChar) {
    // CJK characters: match leading spaces + first character + optional punctuation
    const match =
      /^(\s*)([\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF])([\u3000-\u303F\uFF00-\uFFEF])?/.exec(
        text
      );

    if (match) {
      const [fullMatch, spaces = '', char = '', punctuation = ''] = match;
      firstWord = spaces + char + punctuation;
      remainingText = text.slice(firstWord.length);
    } else {
      firstWord = '';
      remainingText = text;
    }
  } else {
    // For non-CJK text (including mixed content), match until space or CJK char
    const match =
      /^(\s*\S+?)(?=[\s\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]|$)/.exec(
        text
      );

    if (match) {
      firstWord = match[0];
      remainingText = text.slice(firstWord.length);
    } else {
      firstWord = text;
      remainingText = '';
    }
  }

  return { firstWord, remainingText };
};
