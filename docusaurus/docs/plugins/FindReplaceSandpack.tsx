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
import { findReplaceAppCode } from '../sandpack/files/code-FindReplaceApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { findReplaceFiles } from '../sandpack/files/find-replace/code-findReplaceFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const FindReplaceSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={findReplaceAppCode}
    files={{
      ...findReplaceFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
