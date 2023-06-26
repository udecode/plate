import React from 'react';
import {
  commonDeps,
  excalidrawDeps,
  plateTestUtilsDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { serializingCsvAppCode } from '../sandpack/files/code-SerializingCsvApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { serializingCsvFiles } from '../sandpack/files/serializing-csv/code-serializingCsvFiles';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';
import { linkFiles } from '../sandpack/files/link/code-linkFiles';

export const SerializingCsvSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={4}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...excalidrawDeps,
    }}
    appCode={serializingCsvAppCode}
    files={{
      ...serializingCsvFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...softBreakPluginFile,
      ...commonFiles,
      ...typescriptFiles,
      ...linkFiles,
    }}
  />
);
