import { autoformatBlocksFile } from './code-autoformatBlocks';
import { autoformatListsFile } from './code-autoformatLists';
import { autoformatMarksFile } from './code-autoformatMarks';
import { autoformatPluginFile } from './code-autoformatPlugin';
import { autoformatRulesFile } from './code-autoformatRules';
import { autoformatUtilsFile } from './code-autoformatUtils';
import { autoformatValueFile } from './code-autoformatValue';

export const autoformatFiles = {
  ...autoformatBlocksFile,
  ...autoformatListsFile,
  ...autoformatMarksFile,
  ...autoformatPluginFile,
  ...autoformatRulesFile,
  ...autoformatUtilsFile,
  ...autoformatValueFile,
};
