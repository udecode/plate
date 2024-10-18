/* eslint-disable regexp/no-contradiction-with-assertion */
/* eslint-disable regexp/match-any */
/* eslint-disable regexp/no-unused-capturing-group */
export const stripMarkdownBlocks = (text: string) => {
  // Remove headers
  text = text.replaceAll(/^#{1,6}\s+/gm, '');

  // Remove blockquotes
  text = text.replaceAll(/^\s*>\s?/gm, '');

  // Remove horizontal rules
  text = text.replaceAll(/^([*_-]){3,}\s*$/gm, '');

  // Remove list symbols
  text = text.replaceAll(/^(\s*)([*+-]|\d+\.)\s/gm, '$1');

  // Remove code blocks
  text = text.replaceAll(/^```[\S\s]*?^```/gm, '');

  // Replace <br> with \n
  text = text.replaceAll('<br>', '\n');

  return text;
};

export const stripMarkdownInline = (text: string) => {
  // Remove emphasis (bold, italic)
  text = text.replaceAll(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replaceAll(/(\*|_)(.*?)\1/g, '$2');

  // Remove links
  text = text.replaceAll(/\[([^\]]+)]\(([^)]+)\)/g, '$1');

  // Remove inline code
  text = text.replaceAll(/`(.+?)`/g, '$1');

  // Replace HTML entities
  text = text.replaceAll('&nbsp;', ' ');
  text = text.replaceAll('&lt;', '<');
  text = text.replaceAll('&gt;', '>');
  text = text.replaceAll('&amp;', '&');

  return text;
};

export const stripMarkdown = (text: string) => {
  text = stripMarkdownBlocks(text);
  text = stripMarkdownInline(text);

  // Remove HTML tags (including <br>)
  // text = text.replace(/<[^>]*>/g, '');

  // Replace HTML entities
  // text = text.replace('&nbsp;', ' ');
  // text = text.replace('&lt;', '<');
  // text = text.replace('&gt;', '>');
  // text = text.replace('&amp;', '&');

  return text;
};
