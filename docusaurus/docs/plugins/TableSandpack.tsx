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
import { tableAppCode } from '../sandpack/files/code-TableApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { tableFiles } from '../sandpack/files/table/code-tableFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const TableSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={8}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={tableAppCode}
    files={{
      ...tableFiles,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...exitBreakPluginFile,
      ...softBreakPluginFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
