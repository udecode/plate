import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
} from '@udecode/plate';
import { autoformatBlocks } from './autoformatBlocks';
import { autoformatLists } from './autoformatLists';
import { autoformatMarks } from './autoformatMarks';

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatLists,
  ...autoformatMarks,
  ...autoformatPunctuation,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
  ...autoformatMath,
];
