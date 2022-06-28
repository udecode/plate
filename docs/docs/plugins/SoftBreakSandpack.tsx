import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { softBreakAppCode } from '../sandpack/files/code-SoftBreakApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { createListFile } from '../sandpack/files/list/code-createList';
import { resetBlockTypePluginFile } from '../sandpack/files/reset-node/code-resetBlockTypePlugin';
import { softBreakFiles } from '../sandpack/files/soft-break/code-softBreakFiles';
import { trailingBlockPluginFile } from '../sandpack/files/trailing-block/code-trailingBlockPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const SoftBreakSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={5}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={softBreakAppCode}
    files={{
      ...softBreakFiles,
      ...trailingBlockPluginFile,
      ...exitBreakPluginFile,
      ...resetBlockTypePluginFile,
      ...createListFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
