import React from 'react';
import {
  commonDeps,
  excalidrawDeps,
  plateTestUtilsDeps,
  toolbarDeps,
  dndDeps,
} from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { basicElementsFiles } from '../sandpack/files/basic-elements/code-basicElementsFiles';
import { basicMarksFiles } from '../sandpack/files/basic-marks/code-basicMarksFiles';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { serializingHtmlAppCode } from '../sandpack/files/code-SerializingHtmlApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { withStyledDraggablesFile } from '../sandpack/files/dnd/code-withStyledDraggables';
import { serializingHtmlFiles } from '../sandpack/files/serializing-html/code-serializingHtmlFiles';
import { softBreakPluginFile } from '../sandpack/files/soft-break/code-softBreakPlugin';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';
import { linkFiles } from '../sandpack/files/link/code-linkFiles';

export const SerializingHtmlSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={7}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
      ...excalidrawDeps,
      ...dndDeps,
      ...toolbarDeps,
      'prism-react-renderer': '^1.2.0',
    }}
    appCode={serializingHtmlAppCode}
    files={{
      ...serializingHtmlFiles,
      ...basicNodesFiles,
      ...basicElementsFiles,
      ...basicMarksFiles,
      ...softBreakPluginFile,
      ...commonFiles,
      ...typescriptFiles,
      ...linkFiles,
      ...withStyledDraggablesFile,
    }}
  />
);
