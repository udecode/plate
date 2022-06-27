import { forcedLayoutPluginFile } from './code-forcedLayoutPlugin';
import { forcedLayoutValueFile } from './code-forcedLayoutValue';
import { indexFile } from './code-index';

export const forcedLayoutFiles = {
  ...forcedLayoutPluginFile,
  ...forcedLayoutValueFile,
  ...indexFile,
};
