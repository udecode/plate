import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { cursorOverlayAppCode } from '../sandpack/files/code-CursorOverlayApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { cursorOverlayFiles } from '../sandpack/files/cursor-overlay/code-cursorOverlayFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const CursorOverlaySandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={cursorOverlayAppCode}
    files={{
      ...cursorOverlayFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
