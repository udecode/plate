import { cleanCrLf } from './cleanCrLf';
import { removeHtmlSurroundings } from './removeHtmlSurroundings';

const cleaners = [removeHtmlSurroundings, cleanCrLf];

export const preCleanHtml = (html: string): string => {
  return cleaners.reduce((result, clean) => clean(result), html);
};
