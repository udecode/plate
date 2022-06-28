import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsValueFile } from '../sandpack/files/basic-elements/code-basicElementsValue';
import { basicMarksValueFile } from '../sandpack/files/basic-marks/code-basicMarksValue';
import { basicPluginsComponentsAppCode } from '../sandpack/files/code-BasicPluginsComponentsApp';
import { basicPluginsDefaultAppCode } from '../sandpack/files/code-BasicPluginsDefaultApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const BasicPluginsDefaultSandpack = () => (
  <CommonSandpack
    deps={{ ...commonDeps, ...plateTestUtilsDeps }}
    appCode={basicPluginsDefaultAppCode}
    height={542}
    previewSize={6}
    files={{
      ...basicElementsValueFile,
      ...basicMarksValueFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);

export const BasicPluginsComponentsSandpack = () => (
  <CommonSandpack
    height={542}
    previewSize={7}
    deps={{ ...commonDeps, ...plateTestUtilsDeps }}
    appCode={basicPluginsComponentsAppCode}
    files={{
      ...basicElementsValueFile,
      ...basicMarksValueFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
