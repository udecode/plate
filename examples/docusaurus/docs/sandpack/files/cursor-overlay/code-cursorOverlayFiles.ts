import { cursorOverlayContainerFile } from './code-CursorOverlayContainer';
import { cursorOverlayValueFile } from './code-cursorOverlayValue';
import { cursorStoreFile } from './code-cursorStore';
import { dragOverCursorPluginFile } from './code-dragOverCursorPlugin';
import { indexFile } from './code-index';

export const cursorOverlayFiles = {
  ...cursorOverlayContainerFile,
  ...cursorOverlayValueFile,
  ...cursorStoreFile,
  ...dragOverCursorPluginFile,
  ...indexFile,
};
