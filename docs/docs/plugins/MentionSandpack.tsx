import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { mentionAppCode } from '../sandpack/files/code-MentionApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { mentionFiles } from '../sandpack/files/mention/code-mentionFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const MentionSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={5}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={mentionAppCode}
    files={{
      ...mentionFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
