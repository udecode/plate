import { cleanHtmlCrLf } from './cleanHtmlCrLf';
import { removeHtmlSurroundings } from './removeHtmlSurroundings';

const cleaners = [removeHtmlSurroundings, cleanHtmlCrLf];

export const preCleanHtml = (html: string): string => {
  return cleaners.reduce((result, clean) => clean(result), html);
};
