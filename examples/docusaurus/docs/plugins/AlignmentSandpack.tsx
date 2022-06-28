import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { basicNodesPluginsFiles } from '../sandpack/code-files';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { alignFiles } from '../sandpack/files/align/code-alignFiles';
import { alignmentAppCode } from '../sandpack/files/code-AlignmentApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const AlignmentSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={5}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={alignmentAppCode}
    files={{
      ...alignFiles,
      ...basicNodesPluginsFiles,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
