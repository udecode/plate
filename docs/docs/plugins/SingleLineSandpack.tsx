import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { singleLineAppCode } from '../sandpack/files/code-SingleLineApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { singleLineFiles } from '../sandpack/files/single-line/code-singleLineFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const SingleLineSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={singleLineAppCode}
    files={{
      ...singleLineFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
