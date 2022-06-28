import React from 'react';
import { commonDeps, plateTestUtilsDeps } from '../sandpack/code-deps';
import { CommonSandpack } from '../sandpack/CommonSandpack';
import { autoformatFiles } from '../sandpack/files/autoformat/code-autoformatFiles';
import { basicElementsPluginsFile } from '../sandpack/files/basic-elements/code-basicElementsPlugins';
import { basicMarksPluginsFile } from '../sandpack/files/basic-marks/code-basicMarksPlugins';
import { basicNodesFiles } from '../sandpack/files/basic-nodes/code-basicNodesFiles';
import { horizontalRuleAppCode } from '../sandpack/files/code-HorizontalRuleApp';
import { commonFiles } from '../sandpack/files/common/code-commonFiles';
import { horizontalRuleFiles } from '../sandpack/files/horizontal-rule/code-horizontalRuleFiles';
import { selectOnBackspaceFiles } from '../sandpack/files/select-on-backspace/code-selectOnBackspaceFiles';
import { typescriptFiles } from '../sandpack/files/typescript/code-typescriptFiles';

export const HorizontalRuleSandpack = () => (
  <CommonSandpack
    height={722}
    previewSize={3}
    deps={{
      ...commonDeps,
      ...plateTestUtilsDeps,
    }}
    appCode={horizontalRuleAppCode}
    files={{
      ...horizontalRuleFiles,
      ...selectOnBackspaceFiles,
      ...autoformatFiles,
      ...basicNodesFiles,
      ...basicElementsPluginsFile,
      ...basicMarksPluginsFile,
      ...commonFiles,
      ...typescriptFiles,
    }}
  />
);
