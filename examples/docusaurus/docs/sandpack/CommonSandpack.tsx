import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { monokaiPro } from '@codesandbox/sandpack-themes';
import { stylesFile } from './files/code-styles';
import { rootFile } from './code-root';

export const CommonSandpack = ({
  deps,
  files,
  appCode,
  previewSize,
  height = 722,
}: {
  height?: number;
  deps: Record<string, string>;
  appCode: string;
  files: Record<string, string>;
  previewSize?: number;
}) => {
  return (
    <Sandpack
      theme={monokaiPro}
      template="react-ts"
      files={{
        '/App.tsx': appCode,
        ...files,
        ...rootFile,
        ...stylesFile,
      }}
      customSetup={{
        dependencies: deps,
        environment: 'create-react-app-typescript',
      }}
      options={{
        showLineNumbers: true,
        showInlineErrors: true,
        editorHeight: height,
        classes: {
          'sp-stack': `sp-preview-h${previewSize}`,
        },
      }}
    />
  );
};
