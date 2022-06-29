import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksFiles } from '../sandpack/files/basic-marks/code-basicMarksFiles';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { basicMarksAppCode } from '../sandpack/files/code-BasicMarksApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const BasicMarksSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={basicMarksAppCode}
    files={{
      ...basicMarksFiles,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
