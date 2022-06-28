import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicEditorFiles } from '../sandpack/files/basic-editor/code-basicEditorFiles';
import { basicEditorDefaultAppCode } from '../sandpack/files/code-BasicEditorDefaultApp';
import { basicEditorHandlerAppCode } from '../sandpack/files/code-BasicEditorHandlerApp';
import { basicEditorValueAppCode } from '../sandpack/files/code-BasicEditorValueApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const BasicEditorDefaultSandpack = () => (
  <CommonSandpack
    height={342}
    previewSize={1}
    deps={commonDeps}
    appCode={basicEditorDefaultAppCode}
    files={{}}
  />
);

export const BasicEditorValueSandpack = () => (
  <CommonSandpack
    height={542}
    previewSize={1}
    deps={commonDeps}
    appCode={basicEditorValueAppCode}
    files={{
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);

export const BasicEditorHandlerSandpack = () => (
  <CommonSandpack
    height={542}
    previewSize={2}
    deps={{ ...commonDeps, ...plateTestUtilsDeps }}
    appCode={basicEditorHandlerAppCode}
    files={{
      ...commonFiles,
      ...basicEditorFiles,
      ...typescriptFiles,
    }}
  />
);
