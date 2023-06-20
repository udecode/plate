import { ZERO_WIDTH_SPACE } from '../constants';

/**
 * Trim the html and remove zero width spaces,
 * then wrap it with a body element.
 */
export const postCleanHtml = (html: string): string => {
  const cleanHtml = html
    .trim()
    .replaceAll(new RegExp(ZERO_WIDTH_SPACE, 'g'), '');

  return `<body>${cleanHtml}</body>`;
};
