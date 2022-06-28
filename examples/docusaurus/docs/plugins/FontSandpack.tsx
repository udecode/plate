import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicNodesPluginsFile } from '../sandpack/files/basic-elements/code-basicNodesPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { resetBlockTypePluginFile } from '../sandpack/files/reset-node/code-resetBlockTypePlugin';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const FontSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={}
    files={{
      ...basicNodesPluginsFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...exitBreakPluginFile,
      ...resetBlockTypePluginFile,
      ...softBreakPluginFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
