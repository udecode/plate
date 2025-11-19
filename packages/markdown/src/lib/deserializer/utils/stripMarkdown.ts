export const stripMarkdownBlocks = (text: string) => {
  let result = text;

  // Remove headers
  result = result.replaceAll(/^#{1,6}\s+/gm, '');

  // Remove blockquotes
  result = result.replaceAll(/^\s*>\s?/gm, '');

  // Remove horizontal rules
  result = result.replaceAll(/^([*_-]){3,}\s*$/gm, '');

  // Remove list symbols
  result = result.replaceAll(/^(\s*)([*+-]|\d+\.)\s/gm, '$1');

  // Remove code blocks
  result = result.replaceAll(/^```[\S\s]*?^```/gm, '');

  // Replace <br> with \n
  result = result.replaceAll('<br>', '\n');

  return result;
};

export const stripMarkdownInline = (text: string) => {
  let result = text;

  // Remove emphasis (bold, italic)
  result = result.replaceAll(/(\*\*|__)(.*?)\1/g, '$2');
  result = result.replaceAll(/(\*|_)(.*?)\1/g, '$2');

  // Remove links
  result = result.replaceAll(/\[([^\]]+)]\(([^)]+)\)/g, '$1');

  // Remove inline code
  result = result.replaceAll(/`(.+?)`/g, '$1');

  // Replace HTML entities
  result = result.replaceAll('&nbsp;', ' ');
  result = result.replaceAll('&lt;', '<');
  result = result.replaceAll('&gt;', '>');
  result = result.replaceAll('&amp;', '&');

  return result;
};

export const stripMarkdown = (text: string) => {
  let result = stripMarkdownBlocks(text);
  result = stripMarkdownInline(result);

  // Remove HTML tags (including <br>)
  // result = result.replace(/<[^>]*>/g, '');

  // Replace HTML entities
  // result = result.replace('&nbsp;', ' ');
  // result = result.replace('&lt;', '<');
  // result = result.replace('&gt;', '>');
  // result = result.replace('&amp;', '&');

  return result;
};
