// import { Sandpack } from '../../src/Sandpack';
import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { codeIndex } from './sandpack/codeIndex';
import { codePlayground } from './sandpack/codePlayground';
import { codeStyles } from './sandpack/codeStyles';
import { depsPlayground } from './sandpack/depsPlayground';

export const Playground = () => (
  <Sandpack
    theme="dark"
    template="react-ts"
    options={{
      editorHeight: 722,
      // editorWidthPercentage: 100,
      // showRefreshButton: true
    }}
    files={{
      '/App.tsx': codePlayground,
      '/index.tsx': codeIndex,
      '/index.css': codeStyles,
    }}
    customSetup={{
      dependencies: depsPlayground,
      environment: 'create-react-app-typescript',
    }}
  />
);
