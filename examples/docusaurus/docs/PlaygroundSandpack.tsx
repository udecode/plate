import React from 'react';
import { playgroundDeps } from './sandpack/code-deps';
import { rootFile } from './sandpack/code-root';
import { CommonSandpack } from './sandpack/CommonSandpack';
import { rootFiles } from './sandpack/files/code-files';
import { playgroundAppCode } from './sandpack/files/code-PlaygroundApp';
import { playgroundValueFile } from './sandpack/files/code-playgroundValue';
import { toolbarButtonsFile } from './sandpack/files/code-ToolbarButtons';

export const PlaygroundSandpack = () => (
  <CommonSandpack
    deps={playgroundDeps}
    appCode={playgroundAppCode}
    files={{
      ...rootFile,
      ...rootFiles,
      ...toolbarButtonsFile,
      ...playgroundValueFile,
    }}
  />
);
