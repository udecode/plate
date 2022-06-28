import React from 'react';
import {
  commonDeps,
  plateTestUtilsDeps,
  toolbarDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { indentListAppCode } from '../sandpack/files/code-IndentListApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { indentFiles } from '../sandpack/files/indent/code-indentFiles';
import { indentListFiles } from '../sandpack/files/indent-list/code-indentListFiles';
import { toolbarFile } from '../sandpack/files/toolbar/code-Toolbar';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const IndentListSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...toolbarDeps,
    }}
    appCode={indentListAppCode}
    files={{
      ...indentListFiles,
      ...indentFiles,
      ...toolbarFile,
      ...basicElementsPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
