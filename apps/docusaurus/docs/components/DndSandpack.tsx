import React from 'react';
import {
  commonDeps,
  dndDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { tippyCode } from '../sandpack/code-files';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsValueFile } from '../sandpack/files/basic-elements/code-basicElementsValue';
import { dndAppCode } from '../sandpack/files/code-DndApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { dndFiles } from '../sandpack/files/dnd/code-dndFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const DndSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
      ...dndDeps,
    }}
    appCode={dndAppCode}
    cssCode={tippyCode}
    files={{
      ...dndFiles,
      ...basicElementsValueFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
