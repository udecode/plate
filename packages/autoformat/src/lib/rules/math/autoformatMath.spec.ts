import { autoformatArrow } from '../autoformatArrow';
import { autoformatComparison } from './autoformatComparison';
import { autoformatEquality } from './autoformatEquality';
import { autoformatFraction } from './autoformatFraction';
import { autoformatMath } from './autoformatMath';
import { autoformatOperation } from './autoformatOperation';
import {
  autoformatSubscriptNumbers,
  autoformatSubscriptSymbols,
} from './autoformatSubscript';
import {
  autoformatSuperscriptNumbers,
  autoformatSuperscriptSymbols,
} from './autoformatSuperscript';

describe('autoformat math rules', () => {
  it('ships the expected shorthand mappings for arrow, comparison, and equality', () => {
    expect(autoformatArrow).toContainEqual({
      format: '⇐',
      match: ['<=', '≤='],
      mode: 'text',
    });
    expect(autoformatComparison).toContainEqual({
      format: '≰',
      match: '!<=',
      mode: 'text',
    });
    expect(autoformatEquality).toContainEqual({
      format: '≢',
      match: ['!==', '≠='],
      mode: 'text',
    });
  });

  it('includes fraction, superscript, and subscript rules in the exported math group', () => {
    expect(autoformatFraction).toContainEqual({
      format: '⅞',
      match: '7/8',
      mode: 'text',
    });
    expect(autoformatSuperscriptSymbols).toContainEqual({
      format: '°',
      match: '^o',
      mode: 'text',
    });
    expect(autoformatSubscriptNumbers).toContainEqual({
      format: '₉',
      match: '~9',
      mode: 'text',
    });
    expect(autoformatMath).toEqual([
      ...autoformatComparison,
      ...autoformatEquality,
      ...autoformatOperation,
      ...autoformatFraction,
      ...autoformatSuperscriptSymbols,
      ...autoformatSubscriptSymbols,
      ...autoformatSuperscriptNumbers,
      ...autoformatSubscriptNumbers,
    ]);
  });
});
