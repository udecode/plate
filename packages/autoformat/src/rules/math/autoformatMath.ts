import { autoformatComparison } from './autoformatComparison';
import { autoformatEquality } from './autoformatEquality';
import { autoformatFraction } from './autoformatFraction';
import { autoformatOperation } from './autoformatOperation';
import {
  autoformatSubscriptNumbers,
  autoformatSubscriptSymbols,
} from './autoformatSubscript';
import {
  autoformatSuperscriptNumbers,
  autoformatSuperscriptSymbols,
} from './autoformatSuperscript';

export const autoformatMath = [
  ...autoformatComparison,
  ...autoformatEquality,
  ...autoformatOperation,
  ...autoformatFraction,
  ...autoformatSuperscriptSymbols,
  ...autoformatSubscriptSymbols,
  ...autoformatSuperscriptNumbers,
  ...autoformatSubscriptNumbers,
];
