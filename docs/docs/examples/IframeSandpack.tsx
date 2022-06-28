import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { iframeAppCode } from '../sandpack/files/code-IframeApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { editableVoidsFiles } from '../sandpack/files/editable-voids/code-editableVoidsFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { iframeFiles } from '../sandpack/files/iframe/code-iframeFiles';
import { resetBlockTypePluginFile } from '../sandpack/files/reset-node/code-resetBlockTypePlugin';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const IframeSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={iframeAppCode}
    files={{
      ...iframeFiles,
      ...editableVoidsFiles,
      ...basicNodesFiles,
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
