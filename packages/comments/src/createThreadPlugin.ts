import { createPluginFactory } from '@udecode/plate-core';
import { ThreadPlugin } from './types';
import { withThread } from './withThread';

export const ELEMENT_THREAD = 'thread';

export const createThreadPlugin = createPluginFactory<ThreadPlugin>({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  withOverrides: withThread,
});
