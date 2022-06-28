import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { monokaiPro } from '@codesandbox/sandpack-themes';
import clsx from 'clsx';
import { stylesFile } from './files/code-styles';
import { rootFile } from './code-root';

export interface CommonSandpackProps {
  height?: number;
  deps: Record<string, string>;
  appCode: string;
  files: Record<string, string>;
  direction?: 'horizontal' | 'vertical';
  previewSize?: number;
}

export const CommonSandpack = ({
  deps,
  files,
  appCode,
  previewSize,
  direction = 'vertical',
  height = 722,
}: CommonSandpackProps) => {
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
          'sp-stack': clsx(
            direction === 'vertical' && 'sp-stack-vertical',
            `sp-preview-h${previewSize}`
          ),
        },
      }}
    />
  );
};
