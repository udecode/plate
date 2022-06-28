import React from 'react';
import {
  commonDeps,
  juiceDeps,
  plateTestUtilsDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { alignPluginFile } from '../sandpack/files/align/code-alignPlugin';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { serializingDocxAppCode } from '../sandpack/files/code-SerializingDocxApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { indentPluginFile } from '../sandpack/files/indent/code-indentPlugin';
import { lineHeightPluginFile } from '../sandpack/files/line-height/code-lineHeightPlugin';
import { serializingDocxFiles } from '../sandpack/files/serializing-docx/code-serializingDocxFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const SerializingDocxSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...juiceDeps,
    }}
    appCode={serializingDocxAppCode}
    files={{
      ...serializingDocxFiles,
      ...alignPluginFile,
      ...indentPluginFile,
      ...lineHeightPluginFile,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
