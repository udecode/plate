import { history } from '@platejs/plite-history';

import { createBasePlugin } from '../plugin';

export const HistoryPlugin = createBasePlugin({
  key: 'history',
}).extendExtension(history());
