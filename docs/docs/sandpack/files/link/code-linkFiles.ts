import { linkPluginFile } from './code-linkPlugin';
import { linkValueFile } from './code-linkValue';

export const linkFiles = {
  ...linkPluginFile,
  ...linkValueFile,
};
