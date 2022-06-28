import React from 'react';
import { commonDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { typescriptAppCode } from '../sandpack/files/code-TypescriptApp';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const TypescriptSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{ ...commonDeps }}
    appCode={typescriptAppCode}
    files={{
      ...typescriptFiles,
    }}
  />
);
