import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicElementsValueFile } from '../sandpack/files/basic-elements/code-basicElementsValue';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { resetNodeAppCode } from '../sandpack/files/code-ResetNodeApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { resetNodeFiles } from '../sandpack/files/reset-node/code-resetNodeFiles';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { trailingBlockPluginFile } from '../sandpack/files/trailing-block/code-trailingBlockPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const ResetNodeSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={resetNodeAppCode}
    files={{
      ...resetNodeFiles,
      ...basicNodesFiles,
      ...basicElementsValueFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...exitBreakPluginFile,
      ...softBreakPluginFile,
      ...trailingBlockPluginFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
