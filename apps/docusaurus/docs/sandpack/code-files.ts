import { basicElementsPluginsFile } from './files/basic-elements/code-basicElementsPlugins';
import { basicElementsValueFile } from './files/basic-elements/code-basicElementsValue';
import { basicMarksPluginsFile } from './files/basic-marks/code-basicMarksPlugins';
import { basicMarksValueFile } from './files/basic-marks/code-basicMarksValue';
import { basicNodesPluginsFile } from './files/basic-nodes/code-basicNodesPlugins';

export const basicNodesPluginsFiles = {
  ...basicNodesPluginsFile,
  ...basicElementsPluginsFile,
  ...basicMarksPluginsFile,
};

export const basicNodesValueFiles = {
  ...basicElementsValueFile,
  ...basicMarksValueFile,
};

export const tippyCode = `import 'tippy.js/dist/tippy.css'
`;
