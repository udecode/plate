import { basicElementPluginsFile } from './files/basic-elements/code-basicElementPlugins';
import { basicElementsFiles } from './files/basic-elements/code-basicElementsFiles';
import { basicElementsValueFile } from './files/basic-elements/code-basicElementsValue';
import { basicNodesPluginsFile } from './files/basic-elements/code-basicNodesPlugins';
import { basicMarkPluginsFile } from './files/basic-marks/code-basicMarkPlugins';
import { basicMarksFiles } from './files/basic-marks/code-basicMarksFiles';
import { basicMarksValueFile } from './files/basic-marks/code-basicMarksValue';

export const basicNodesPluginsFiles = {
  ...basicNodesPluginsFile,
  ...basicElementPluginsFile,
  ...basicMarkPluginsFile,
};

export const basicNodesValueFiles = {
  ...basicElementsValueFile,
  ...basicMarksValueFile,
};

export const basicNodesFiles = {
  ...basicNodesPluginsFile,
  ...basicElementsFiles,
  ...basicMarksFiles,
};
