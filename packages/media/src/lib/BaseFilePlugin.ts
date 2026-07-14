import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFilePlugin = createBasePlugin({
  key: KEYS.file,
  node: { isElement: true, isVoid: true },
});
