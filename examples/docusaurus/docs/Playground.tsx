// import { Sandpack } from '../../src/Sandpack';
import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { autoformatBlocksCode } from './sandpack/autoformat/code-autoformatBlocks';
import { autoformatListsCode } from './sandpack/autoformat/code-autoformatLists';
import { autoformatMarksCode } from './sandpack/autoformat/code-autoformatMarks';
import { autoformatRulesCode } from './sandpack/autoformat/code-autoformatRules';
import { autoformatUtilsCode } from './sandpack/autoformat/code-autoformatUtils';
import { depsCode } from './sandpack/code-deps';
import { codeStyles } from './sandpack/code-styles';
import { codeIndex } from './sandpack/codeIndex';
import { codePlayground } from './sandpack/codePlayground';
import { CursorOverlayContainerCode } from './sandpack/components/code-CursorOverlayContainer';
import { ToolbarsCode } from './sandpack/components/code-Toolbars';
import { withStyledDraggablesCode } from './sandpack/components/code-withStyledDraggables';
import { withStyledPlaceHoldersCode } from './sandpack/components/code-withStyledPlaceHolders';
import { initialDataExcalidrawCode } from './sandpack/values/code-initialDataExcalidraw';
import { utilsCode } from './sandpack/values/code-utils';
import { valuesCode } from './sandpack/values/code-values';

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
      '/autoformat/autoformatBlocks.ts': autoformatBlocksCode,
      '/autoformat/autoformatLists.ts': autoformatListsCode,
      '/autoformat/autoformatMarks.ts': autoformatMarksCode,
      '/autoformat/autoformatRules.ts': autoformatRulesCode,
      '/autoformat/autoformatUtils.ts': autoformatUtilsCode,
      '/components/CursorOverlayContainer.ts': CursorOverlayContainerCode,
      '/components/Toolbars.ts': ToolbarsCode,
      '/components/withStyledDraggables.ts': withStyledDraggablesCode,
      '/components/withStyledPlaceHolders.ts': withStyledPlaceHoldersCode,
      '/components/initialDataExcalidraw.ts': initialDataExcalidrawCode,
      '/components/utils.ts': utilsCode,
      '/components/values.ts': valuesCode,
    }}
    customSetup={{
      dependencies: depsCode,
      environment: 'create-react-app-typescript',
    }}
  />
);
