import { describe, it, expect } from 'vitest';
import {
  lowerLetter,
  upperLetter,
  lowerRoman,
  upperRoman,
  ordinal,
  cardinalText,
  ordinalText,
  bullet,
  decimal,
  getNumberingText,
  createNumberingCounter,
  incrementCounter,
  getCounterValue,
  createNumberingCounters,
  getOrCreateCounter,
  type NumberingScheme
} from './numbering';

describe('numbering utilities', () => {
  describe('lowerLetter', () => {
    it('converts numbers to lowercase letters', () => {
      expect(lowerLetter(1)).toBe('a');
      expect(lowerLetter(2)).toBe('b');
      expect(lowerLetter(26)).toBe('z');
      expect(lowerLetter(27)).toBe('aa');
      expect(lowerLetter(28)).toBe('ab');
      expect(lowerLetter(52)).toBe('az');
      expect(lowerLetter(53)).toBe('ba');
    });

    it('handles edge cases', () => {
      expect(lowerLetter(0)).toBe('');
      expect(lowerLetter(-1)).toBe('');
    });
  });

  describe('upperLetter', () => {
    it('converts numbers to uppercase letters', () => {
      expect(upperLetter(1)).toBe('A');
      expect(upperLetter(2)).toBe('B');
      expect(upperLetter(26)).toBe('Z');
      expect(upperLetter(27)).toBe('AA');
      expect(upperLetter(28)).toBe('AB');
      expect(upperLetter(52)).toBe('AZ');
      expect(upperLetter(53)).toBe('BA');
    });

    it('handles edge cases', () => {
      expect(upperLetter(0)).toBe('');
      expect(upperLetter(-1)).toBe('');
    });
  });

  describe('lowerRoman', () => {
    it('converts numbers to lowercase Roman numerals', () => {
      expect(lowerRoman(1)).toBe('i');
      expect(lowerRoman(2)).toBe('ii');
      expect(lowerRoman(3)).toBe('iii');
      expect(lowerRoman(4)).toBe('iv');
      expect(lowerRoman(5)).toBe('v');
      expect(lowerRoman(9)).toBe('ix');
      expect(lowerRoman(10)).toBe('x');
      expect(lowerRoman(40)).toBe('xl');
      expect(lowerRoman(50)).toBe('l');
      expect(lowerRoman(90)).toBe('xc');
      expect(lowerRoman(100)).toBe('c');
      expect(lowerRoman(400)).toBe('cd');
      expect(lowerRoman(500)).toBe('d');
      expect(lowerRoman(900)).toBe('cm');
      expect(lowerRoman(1000)).toBe('m');
      expect(lowerRoman(1994)).toBe('mcmxciv');
    });

    it('handles edge cases', () => {
      expect(lowerRoman(0)).toBe('');
      expect(lowerRoman(-1)).toBe('');
      expect(lowerRoman(4000)).toBe('4000'); // Beyond Roman numeral range
    });
  });

  describe('upperRoman', () => {
    it('converts numbers to uppercase Roman numerals', () => {
      expect(upperRoman(1)).toBe('I');
      expect(upperRoman(2)).toBe('II');
      expect(upperRoman(3)).toBe('III');
      expect(upperRoman(4)).toBe('IV');
      expect(upperRoman(5)).toBe('V');
      expect(upperRoman(9)).toBe('IX');
      expect(upperRoman(10)).toBe('X');
      expect(upperRoman(40)).toBe('XL');
      expect(upperRoman(50)).toBe('L');
      expect(upperRoman(90)).toBe('XC');
      expect(upperRoman(100)).toBe('C');
      expect(upperRoman(400)).toBe('CD');
      expect(upperRoman(500)).toBe('D');
      expect(upperRoman(900)).toBe('CM');
      expect(upperRoman(1000)).toBe('M');
      expect(upperRoman(1994)).toBe('MCMXCIV');
    });

    it('handles edge cases', () => {
      expect(upperRoman(0)).toBe('');
      expect(upperRoman(-1)).toBe('');
      expect(upperRoman(4000)).toBe('4000'); // Beyond Roman numeral range
    });
  });

  describe('ordinal', () => {
    it('converts numbers to ordinal format', () => {
      expect(ordinal(1)).toBe('1st');
      expect(ordinal(2)).toBe('2nd');
      expect(ordinal(3)).toBe('3rd');
      expect(ordinal(4)).toBe('4th');
      expect(ordinal(10)).toBe('10th');
      expect(ordinal(11)).toBe('11th'); // Special case
      expect(ordinal(12)).toBe('12th'); // Special case
      expect(ordinal(13)).toBe('13th'); // Special case
      expect(ordinal(21)).toBe('21st');
      expect(ordinal(22)).toBe('22nd');
      expect(ordinal(23)).toBe('23rd');
      expect(ordinal(101)).toBe('101st');
      expect(ordinal(111)).toBe('111th'); // Special case
    });

    it('handles edge cases', () => {
      expect(ordinal(0)).toBe('');
      expect(ordinal(-1)).toBe('');
    });
  });

  describe('cardinalText', () => {
    it('converts numbers to cardinal text', () => {
      expect(cardinalText(1)).toBe('one');
      expect(cardinalText(2)).toBe('two');
      expect(cardinalText(10)).toBe('ten');
      expect(cardinalText(11)).toBe('eleven');
      expect(cardinalText(19)).toBe('nineteen');
      expect(cardinalText(20)).toBe('twenty');
      expect(cardinalText(21)).toBe('twenty-one');
      expect(cardinalText(30)).toBe('thirty');
      expect(cardinalText(99)).toBe('ninety-nine');
      expect(cardinalText(100)).toBe('one hundred');
      expect(cardinalText(101)).toBe('one hundred one');
      expect(cardinalText(120)).toBe('one hundred twenty');
      expect(cardinalText(121)).toBe('one hundred twenty-one');
      expect(cardinalText(999)).toBe('nine hundred ninety-nine');
    });

    it('handles edge cases', () => {
      expect(cardinalText(0)).toBe('');
      expect(cardinalText(-1)).toBe('');
      expect(cardinalText(1000)).toBe('1000'); // Beyond text range
    });
  });

  describe('ordinalText', () => {
    it('converts numbers to ordinal text', () => {
      expect(ordinalText(1)).toBe('first');
      expect(ordinalText(2)).toBe('second');
      expect(ordinalText(3)).toBe('third');
      expect(ordinalText(4)).toBe('fourth');
      expect(ordinalText(10)).toBe('tenth');
      expect(ordinalText(11)).toBe('eleventh');
      expect(ordinalText(19)).toBe('nineteenth');
      expect(ordinalText(20)).toBe('twentieth');
      expect(ordinalText(21)).toBe('twenty-first');
      expect(ordinalText(30)).toBe('thirtieth');
      expect(ordinalText(99)).toBe('ninety-ninth');
      expect(ordinalText(100)).toBe('one hundredth');
      expect(ordinalText(101)).toBe('one hundred first');
      expect(ordinalText(120)).toBe('one hundred twentieth');
      expect(ordinalText(121)).toBe('one hundred twenty-first');
    });

    it('handles edge cases', () => {
      expect(ordinalText(0)).toBe('');
      expect(ordinalText(-1)).toBe('');
      expect(ordinalText(1000)).toBe('1000th'); // Falls back to numeric ordinal
    });
  });

  describe('bullet', () => {
    it('returns bullet symbol regardless of number', () => {
      expect(bullet(1)).toBe('•');
      expect(bullet(2)).toBe('•');
      expect(bullet(100)).toBe('•');
    });
  });

  describe('decimal', () => {
    it('returns number as string', () => {
      expect(decimal(1)).toBe('1');
      expect(decimal(42)).toBe('42');
      expect(decimal(1000)).toBe('1000');
    });
  });

  describe('getNumberingText', () => {
    it('dispatches to correct numbering function', () => {
      const testCases: Array<[NumberingScheme, number, string]> = [
        ['lowerLetter', 1, 'a'],
        ['upperLetter', 1, 'A'],
        ['lowerRoman', 5, 'v'],
        ['upperRoman', 5, 'V'],
        ['ordinal', 1, '1st'],
        ['cardinalText', 5, 'five'],
        ['ordinalText', 5, 'fifth'],
        ['bullet', 1, '•'],
        ['decimal', 42, '42']
      ];

      testCases.forEach(([scheme, num, expected]) => {
        expect(getNumberingText(num, scheme)).toBe(expected);
      });
    });

    it('defaults to decimal for unknown schemes', () => {
      // TypeScript would prevent this, but test the runtime behavior
      expect(getNumberingText(42, 'unknown' as NumberingScheme)).toBe('42');
    });
  });

  describe('NumberingCounter', () => {
    describe('createNumberingCounter', () => {
      it('creates empty counter', () => {
        const counter = createNumberingCounter();
        expect(counter.counters).toEqual([]);
        expect(counter.maxLevel).toBe(0);
      });
    });

    describe('incrementCounter', () => {
      it('increments counter at specified level', () => {
        const counter = createNumberingCounter();
        
        expect(incrementCounter(counter, 0)).toBe(1);
        expect(counter.counters[0]).toBe(1);
        expect(counter.maxLevel).toBe(0);
        
        expect(incrementCounter(counter, 0)).toBe(2);
        expect(counter.counters[0]).toBe(2);
      });

      it('extends counter array as needed', () => {
        const counter = createNumberingCounter();
        
        expect(incrementCounter(counter, 2)).toBe(1);
        expect(counter.counters).toEqual([0, 0, 1]);
        expect(counter.maxLevel).toBe(2);
      });

      it('resets deeper levels when incrementing', () => {
        const counter = createNumberingCounter();
        
        // Build up some nested levels
        incrementCounter(counter, 0); // [1]
        incrementCounter(counter, 1); // [1, 1]  
        incrementCounter(counter, 2); // [1, 1, 1]
        incrementCounter(counter, 2); // [1, 1, 2]
        
        // Now increment a higher level - should reset lower levels
        incrementCounter(counter, 0); // [2, 0, 0]
        
        expect(counter.counters).toEqual([2, 0, 0]);
      });
    });

    describe('getCounterValue', () => {
      it('returns counter value at specified level', () => {
        const counter = createNumberingCounter();
        incrementCounter(counter, 0);
        incrementCounter(counter, 1);
        
        expect(getCounterValue(counter, 0)).toBe(1);
        expect(getCounterValue(counter, 1)).toBe(1);
      });

      it('returns 0 for out-of-bounds levels', () => {
        const counter = createNumberingCounter();
        expect(getCounterValue(counter, 0)).toBe(0);
        expect(getCounterValue(counter, -1)).toBe(0);
        expect(getCounterValue(counter, 10)).toBe(0);
      });
    });
  });

  describe('NumberingCounters', () => {
    describe('createNumberingCounters', () => {
      it('creates empty counters collection', () => {
        const counters = createNumberingCounters();
        expect(counters).toEqual({});
      });
    });

    describe('getOrCreateCounter', () => {
      it('creates new counter if it does not exist', () => {
        const counters = createNumberingCounters();
        const counter = getOrCreateCounter(counters, 'numId1');
        
        expect(counter).toBeDefined();
        expect(counter.counters).toEqual([]);
        expect(counters['numId1']).toBe(counter);
      });

      it('returns existing counter if it exists', () => {
        const counters = createNumberingCounters();
        const counter1 = getOrCreateCounter(counters, 'numId1');
        const counter2 = getOrCreateCounter(counters, 'numId1');
        
        expect(counter1).toBe(counter2);
      });

      it('maintains separate counters for different IDs', () => {
        const counters = createNumberingCounters();
        const counter1 = getOrCreateCounter(counters, 'numId1');
        const counter2 = getOrCreateCounter(counters, 'numId2');
        
        incrementCounter(counter1, 0);
        incrementCounter(counter2, 0);
        incrementCounter(counter2, 0);
        
        expect(getCounterValue(counter1, 0)).toBe(1);
        expect(getCounterValue(counter2, 0)).toBe(2);
      });
    });
  });
});