import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicElementToolbarButtonsFile } from '../sandpack/files/basic-elements/code-BasicElementToolbarButtons';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { placeholderAppCode } from '../sandpack/files/code-PlaceholderApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { placeholderFiles } from '../sandpack/files/placeholder/code-placeholderFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const PlaceholderSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={4}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={placeholderAppCode}
    files={{
      ...placeholderFiles,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementToolbarButtonsFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...exitBreakPluginFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
