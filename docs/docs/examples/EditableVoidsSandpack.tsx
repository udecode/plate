import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesPluginsFile } from '../sandpack/files/basic-nodes/code-basicNodesPlugins';
import { editableVoidsAppCode } from '../sandpack/files/code-EditableVoidsApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { editableVoidsFiles } from '../sandpack/files/editable-voids/code-editableVoidsFiles';
import { exitBreakPluginFile } from '../sandpack/files/exit-break/code-exitBreakPlugin';
import { resetBlockTypePluginFile } from '../sandpack/files/reset-node/code-resetBlockTypePlugin';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const EditableVoidsSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={editableVoidsAppCode}
    files={{
      ...editableVoidsFiles,
      ...exitBreakPluginFile,
      ...resetBlockTypePluginFile,
      ...softBreakPluginFile,
      ...basicNodesPluginsFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
