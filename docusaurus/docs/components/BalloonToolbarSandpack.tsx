import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { tippyCode } from '../sandpack/code-files';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { balloonToolbarFiles } from '../sandpack/files/balloon-toolbar/code-balloonToolbarFiles';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { balloonToolbarAppCode } from '../sandpack/files/code-BalloonToolbarApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const BalloonToolbarSandpack = () => (
  <CommonSandpack
    height={522}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={balloonToolbarAppCode}
    cssCode={tippyCode}
    files={{
      ...balloonToolbarFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
