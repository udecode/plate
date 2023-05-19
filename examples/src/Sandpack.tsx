import React from 'react';
import {
  Sandpack as DefaultSandpack,
  SandpackSetup,
} from '@codesandbox/sandpack-react';

const customSetup: SandpackSetup = {
  dependencies: {
    react: '17.0.2',
    'react-dom': '17.0.2',
    'react-scripts': '4.0.3',
  },
  environment: 'create-react-app-typescript',
};

export function Sandpack({}: any) {
  return (
    <DefaultSandpack
      theme="dark"
      template="react-ts"
      // options={}
      // files={}
      customSetup={customSetup}
      // environment="create-react-app-typescript"
    />
  );
}
