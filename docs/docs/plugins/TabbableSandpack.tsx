import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesPluginsFile } from '../sandpack/files/basic-nodes/code-basicNodesPlugins';
import { tabbableAppCode } from '../sandpack/files/code-TabbableApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { tabbableFiles } from '../sandpack/files/tabbable/code-tabbableFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const TabbableSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={tabbableAppCode}
    files={{
      ...tabbableFiles,
      ...basicNodesPluginsFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
