import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  AutoformatRule,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';

import { autoformatBlocks } from './autoformatBlocks';
import { autoformatIndentTodo } from './autoformatIndentTodo';
import { autoformatMarks } from './autoformatMarks';

export const autoformatRules: AutoformatRule[] = [
  ...autoformatBlocks,
  ...autoformatMarks,
  ...autoformatSmartQuotes,
  ...autoformatPunctuation,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
  ...autoformatMath,
  ...autoformatIndentTodo,
];
