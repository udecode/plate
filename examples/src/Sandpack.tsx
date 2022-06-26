import React from 'react';
import { Sandpack as DefaultSandpack } from '@codesandbox/sandpack-react';

export const Sandpack = ({ code }: any) => (
  <DefaultSandpack
    theme="dark"
    template="react-ts"
    options={{
      editorHeight: 722,
      // editorWidthPercentage: 100,
      // showRefreshButton: true
    }}
    files={{
      '/App.tsx': code,
    }}
    customSetup={{
      dependencies: {
        react: '17.0.2',
        'react-dom': '17.0.2',
        'react-scripts': '4.0.3',
      },
      environment: 'create-react-app-typescript',
    }}
    // environment="create-react-app-typescript"
  />
);
