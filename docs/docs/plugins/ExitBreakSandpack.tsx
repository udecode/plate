import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { exitBreakAppCode } from '../sandpack/files/code-ExitBreakApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakFiles } from '../sandpack/files/exit-break/code-exitBreakFiles';
import { listFiles } from '../sandpack/files/list/code-listFiles';
import { resetBlockTypePluginFile } from '../sandpack/files/reset-node/code-resetBlockTypePlugin';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { tableValueFile } from '../sandpack/files/table/code-tableValue';
import { trailingBlockPluginFile } from '../sandpack/files/trailing-block/code-trailingBlockPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const ExitBreakSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={exitBreakAppCode}
    files={{
      ...exitBreakFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...resetBlockTypePluginFile,
      ...softBreakPluginFile,
      ...trailingBlockPluginFile,
      ...listFiles,
      ...tableValueFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
