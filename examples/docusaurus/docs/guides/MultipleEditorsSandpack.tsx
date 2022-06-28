import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { basicNodesFiles } from '../sandpack/code-files';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { markBallonToolbarFile } from '../sandpack/files/balloon-toolbar/code-MarkBallonToolbar';
import { multipleEditorsAppCode } from '../sandpack/files/code-MultipleEditorsApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { imageFiles } from '../sandpack/files/image/code-imageFiles';
import { selectOnBackspacePluginFile } from '../sandpack/files/select-on-backspace/code-selectOnBackspacePlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const MultipleEditorsSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{ ...commonDeps, ...plateTestUtilsDeps, ...toolbarDeps }}
    appCode={multipleEditorsAppCode}
    files={{
      ...markBallonToolbarFile,
      ...imageFiles,
      ...selectOnBackspacePluginFile,
      ...basicNodesFiles,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
