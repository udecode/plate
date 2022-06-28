export const cursorStoreCode = `import { createStore } from '@udecode/zustood';

export const cursorStore = createStore('cursor')({
  cursors: {},
});
`;

export const cursorStoreFile = {
  '/cursor-overlay/cursorStore.ts': cursorStoreCode,
};
