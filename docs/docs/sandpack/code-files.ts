import { basicElementsPluginsFile } from './files/basic-elements/code-basicElementsPlugins';
import { basicElementsValueFile } from './files/basic-elements/code-basicElementsValue';
import { basicNodesPluginsFile } from './files/basic-elements/code-basicNodesPlugins';
import { basicMarksPluginsFile } from './files/basic-marks/code-basicMarksPlugins';
import { basicMarksValueFile } from './files/basic-marks/code-basicMarksValue';

export const basicNodesPluginsFiles = {
  ...basicNodesPluginsFile,
  ...basicElementsPluginsFile,
  ...basicMarksPluginsFile,
};

export const basicNodesValueFiles = {
  ...basicElementsValueFile,
  ...basicMarksValueFile,
};
