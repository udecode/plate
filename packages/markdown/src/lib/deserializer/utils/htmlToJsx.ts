import { legacyHtmlToJsx } from '../../internal/legacyHtmlToJsx';
import { isAutolink } from '../../internal/nativeAutolink';

export const htmlToJsx = (html: string): string =>
  legacyHtmlToJsx(html, isAutolink);
