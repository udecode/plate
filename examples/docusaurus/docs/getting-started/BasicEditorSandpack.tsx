import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicEditorFiles } from '../sandpack/files/basic-editor/code-basicEditorFiles';
import { basicEditorDefaultAppCode } from '../sandpack/files/code-BasicEditorDefaultApp';
import { basicEditorHandlerAppCode } from '../sandpack/files/code-BasicEditorHandlerApp';
import { basicEditorValueAppCode } from '../sandpack/files/code-BasicEditorValueApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';

export const BasicEditorDefaultSandpack = () => (
  <CommonSandpack
    deps={commonDeps}
    appCode={basicEditorDefaultAppCode}
    height={342}
    previewSize={2}
    files={{}}
  />
);

export const BasicEditorValueSandpack = () => (
  <CommonSandpack
    deps={commonDeps}
    appCode={basicEditorValueAppCode}
    height={542}
    previewSize={2}
    files={{
      ...commonFiles,
    }}
  />
);

export const BasicEditorHandlerSandpack = () => (
  <CommonSandpack
    deps={{ ...commonDeps, ...plateTestUtilsDeps }}
    appCode={basicEditorHandlerAppCode}
    height={542}
    previewSize={2}
    files={{
      ...commonFiles,
      ...basicEditorFiles,
    }}
  />
);
