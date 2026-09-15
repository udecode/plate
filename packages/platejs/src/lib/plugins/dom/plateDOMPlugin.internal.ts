import { dom, type DOMPlugin } from '../../../dom/plite-dom.internal';

/** One exact DOM descriptor shared by Base and React capability lookup. */
export const plateDOMPlugin: DOMPlugin = dom();
