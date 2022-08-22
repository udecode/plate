import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { serializingMdAppCode } from '../sandpack/files/code-SerializingMdApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { serializingMdFiles } from '../sandpack/files/serializing-md/code-serializingMdFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';
import { linkFiles } from '../sandpack/files/link/code-linkFiles';

export const SerializingMdSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={serializingMdAppCode}
    files={{
      ...serializingMdFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
      ...linkFiles,
    }}
  />
);
