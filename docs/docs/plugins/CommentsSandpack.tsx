import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { balloonToolbarFiles } from '../sandpack/files/balloon-toolbar/code-balloonToolbarFiles';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { commentsAppCode } from '../sandpack/files/code-CommentsApp';
import { commentsFiles } from '../sandpack/files/comments/code-commentsFiles';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const CommentsSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={commentsAppCode}
    files={{
      ...balloonToolbarFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commentsFiles,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
