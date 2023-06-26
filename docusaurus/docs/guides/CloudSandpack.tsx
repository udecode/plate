import React from 'react';
import {
  cloudDeps,
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { cloudFiles } from '../sandpack/files/cloud/code-cloudFiles';
import { cloudAppCode } from '../sandpack/files/code-CloudApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { selectOnBackspacePluginFile } from '../sandpack/files/select-on-backspace/code-selectOnBackspacePlugin';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const CloudSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={8}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
      ...cloudDeps,
    }}
    appCode={cloudAppCode}
    files={{
      ...cloudFiles,
      ...selectOnBackspacePluginFile,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
