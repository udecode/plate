export const cursorStoreCode = `import { createStore } from '@udecode/plate';

export const cursorStore = createStore('cursor')({
  cursors: {},
});
`;

export const cursorStoreFile = {
  '/cursor-overlay/cursorStore.ts': cursorStoreCode,
};
