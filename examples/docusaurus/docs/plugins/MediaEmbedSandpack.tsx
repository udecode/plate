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
import { mediaEmbedAppCode } from '../sandpack/files/code-MediaEmbedApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { mediaEmbedFiles } from '../sandpack/files/media-embed/code-mediaEmbedFiles';
import { selectOnBackspacePluginFile } from '../sandpack/files/select-on-backspace/code-selectOnBackspacePlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const MediaEmbedSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={8}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={mediaEmbedAppCode}
    files={{
      ...mediaEmbedFiles,
      ...selectOnBackspacePluginFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
