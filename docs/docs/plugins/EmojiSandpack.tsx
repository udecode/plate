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
import { emojiAppCode } from '../sandpack/files/code-EmojiApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { emojiFiles } from '../sandpack/files/emoji/code-emojiFiles';
import { toolbarFiles } from '../sandpack/files/toolbar/code-toolbarFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const EmojiSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={5}
    deps={{
      ...commonDeps,
      ...toolbarDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={emojiAppCode}
    files={{
      ...emojiFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...toolbarFiles,
      ...typescriptFiles,
    }}
  />
);
