import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { kbdAppCode } from '../sandpack/files/code-KbdApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { kbdFiles } from '../sandpack/files/kbd/code-kbdFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const KbdSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={kbdAppCode}
    files={{
      ...kbdFiles,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
