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
import { linkAppCode } from '../sandpack/files/code-LinkApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { linkFiles } from '../sandpack/files/link/code-linkFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const LinkSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={4}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={linkAppCode}
    files={{
      ...linkFiles,
      ...toolbarFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
