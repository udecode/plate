import { autoformatBlocks } from './block/autoformatBlocks';
import { autoformatLists } from './block/autoformatLists';
import { autoformatMarks } from './mark/autoformatMarks';
import { autoformatArrow } from './text/autoformatArrow';
import { autoformatLegal, autoformatLegalHtml } from './text/autoformatLegal';
import { autoformatPunctuation } from './text/autoformatPunctuation';
import { autoformatMathComparison } from './text/math/autoformatMathComparison';
import { autoformatMathEquality } from './text/math/autoformatMathEquality';
import { autoformatMathFraction } from './text/math/autoformatMathFraction';
import {
  autoformatMathDivision,
  autoformatMathMultiplication,
  autoformatMathOperation,
} from './text/math/autoformatMathOperation';
import {
  autoformatMathSubscriptNumbers,
  autoformatMathSubscriptSymbols,
} from './text/math/autoformatMathSubscript';
import {
  autoformatMathSuperscriptNumbers,
  autoformatMathSuperscriptSymbols,
} from './text/math/autoformatMathSuperscript';

export const autoformatMath = [
  ...autoformatMathComparison,
  ...autoformatMathEquality,
  ...autoformatMathOperation,
  ...autoformatMathMultiplication,
  ...autoformatMathDivision,
  ...autoformatMathFraction,
  ...autoformatMathSuperscriptSymbols,
  ...autoformatMathSubscriptSymbols,
  ...autoformatMathSuperscriptNumbers,
  ...autoformatMathSubscriptNumbers,
];

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
