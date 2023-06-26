import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { tippyCode } from '../sandpack/code-files';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { markBalloonToolbarFile } from '../sandpack/files/balloon-toolbar/code-MarkBalloonToolbar';
import { basicElementsFiles } from '../sandpack/files/basic-elements/code-basicElementsFiles';
import { basicMarksFiles } from '../sandpack/files/basic-marks/code-basicMarksFiles';
import { basicNodesPluginsFile } from '../sandpack/files/basic-nodes/code-basicNodesPlugins';
import { multipleEditorsAppCode } from '../sandpack/files/code-MultipleEditorsApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { mediaFiles } from '../sandpack/files/media/code-mediaFiles';
import { selectOnBackspacePluginFile } from '../sandpack/files/select-on-backspace/code-selectOnBackspacePlugin';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const MultipleEditorsSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{ ...commonDeps, ...plateTestUtilsDeps, ...toolbarDeps }}
    appCode={multipleEditorsAppCode}
    cssCode={tippyCode}
    files={{
      ...markBalloonToolbarFile,
      ...mediaFiles,
      ...toolbarFile,
      ...selectOnBackspacePluginFile,
      ...basicNodesPluginsFile,
      ...basicElementsFiles,
      ...basicMarksFiles,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
