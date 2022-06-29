import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { forcedLayoutAppCode } from '../sandpack/files/code-ForcedLayoutApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { forcedLayoutFiles } from '../sandpack/files/forced-layout/code-forcedLayoutFiles';
import { trailingBlockFiles } from '../sandpack/files/trailing-block/code-trailingBlockFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const ForcedLayoutSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={4}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={forcedLayoutAppCode}
    files={{
      ...forcedLayoutFiles,
      ...trailingBlockFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
