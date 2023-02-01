import { tabbableElementFile } from './code-TabbableElement';
import { createTabbableElementPluginFile } from './code-createTabbableElementPlugin';
import { tabbableValueFile } from './code-tabbableValue';

export const tabbableFiles = {
  ...tabbableElementFile,
  ...createTabbableElementPluginFile,
  ...tabbableValueFile,
};
