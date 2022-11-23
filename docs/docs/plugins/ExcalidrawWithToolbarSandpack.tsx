import React from 'react';
import {
  commonDeps,
  excalidrawDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { excalidrawWithToolbarAppCode } from '../sandpack/files/code-ExcalidrawWithToolbarApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { excalidrawFiles } from '../sandpack/files/excalidraw/code-excalidrawFiles';
import { selectOnBackspaceFiles } from '../sandpack/files/select-on-backspace/code-selectOnBackspaceFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const ExcalidrawWithToolbarSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={8}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...excalidrawDeps,
      ...toolbarDeps,
    }}
    appCode={excalidrawWithToolbarAppCode}
    files={{
      ...excalidrawFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...selectOnBackspaceFiles,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
