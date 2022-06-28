import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { plainTextValueFile } from '../sandpack/files/basic-editor/code-plainTextValue';
import { plateAppCode } from '../sandpack/files/code-PlateApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const PlateSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={2}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={plateAppCode}
    files={{
      ...plainTextValueFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
