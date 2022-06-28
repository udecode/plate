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
import { imageAppCode } from '../sandpack/files/code-ImageApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { imageFiles } from '../sandpack/files/image/code-imageFiles';
import { selectOnBackspacePluginFile } from '../sandpack/files/select-on-backspace/code-selectOnBackspacePlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const ImageSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={imageAppCode}
    files={{
      ...imageFiles,
      ...selectOnBackspacePluginFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
