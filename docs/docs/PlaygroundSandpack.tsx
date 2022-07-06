import React from 'react';
import { tippyCode } from '@site/docs/sandpack/code-files';
import { playgroundDeps } from './sandpack/code-deps';
import { rootFile } from './sandpack/code-root';
import { CommonSandpack, CommonSandpackProps } from './sandpack/CommonSandpack';
import { rootFiles } from './sandpack/files/code-files';
import { playgroundAppCode } from './sandpack/files/code-PlaygroundApp';
import { playgroundValueFile } from './sandpack/files/code-playgroundValue';
import { toolbarButtonsFile } from './sandpack/files/code-ToolbarButtons';
import { toolbarFile } from './sandpack/files/toolbar/code-Toolbar';

export const PlaygroundSandpack = (props: CommonSandpackProps) => (
  <CommonSandpack
    deps={playgroundDeps}
    appCode={playgroundAppCode}
    files={{
      ...rootFile,
      ...rootFiles,
      ...toolbarFile,
      ...toolbarButtonsFile,
      ...playgroundValueFile,
    }}
    cssCode={tippyCode}
    {...props}
  />
);
