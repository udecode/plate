import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesPluginsFile } from '../sandpack/files/basic-nodes/code-basicNodesPlugins';
import { previewMdAppCode } from '../sandpack/files/code-PreviewMdApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { previewMarkdownFiles } from '../sandpack/files/preview-markdown/code-previewMarkdownFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const PreviewMdSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={6}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={previewMdAppCode}
    files={{
      ...previewMarkdownFiles,
      ...basicNodesPluginsFile,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
