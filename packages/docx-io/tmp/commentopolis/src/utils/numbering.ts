/**
 * Automatic Numbering Utilities for Word Documents
 * Provides support for various numbering schemes including letters, romans, ordinals, etc.
 */

/**
 * Numbering scheme types supported
 */
export type NumberingScheme = 
  | 'lowerLetter' 
  | 'upperLetter' 
  | 'lowerRoman' 
  | 'upperRoman' 
  | 'ordinal' 
  | 'cardinalText' 
  | 'ordinalText' 
  | 'bullet'
  | 'decimal'; // Standard decimal numbering

/**
 * Convert number to lowercase letters (a, b, c, ... z, aa, bb, cc, ...)
 */
export function lowerLetter(num: number): string {
  if (num < 1) return '';
  
  let result = '';
  let n = num;
  
  while (n > 0) {
    n--; // Adjust for 0-indexed calculation
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  
  return result;
}

/**
 * Convert number to uppercase letters (A, B, C, ... Z, AA, BB, CC, ...)
 */
export function upperLetter(num: number): string {
  if (num < 1) return '';
  
  let result = '';
  let n = num;
  
  while (n > 0) {
    n--; // Adjust for 0-indexed calculation
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  
  return result;
}

/**
 * Convert number to lowercase Roman numerals (i, ii, iii, iv, v, ...)
 */
export function lowerRoman(num: number): string {
  if (num < 1) return '';
  if (num > 3999) return num.toString(); // Roman numerals don't go beyond 3999
  
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'];
  
  let result = '';
  let n = num;
  
  for (let i = 0; i < values.length; i++) {
    while (n >= values[i]) {
      result += numerals[i];
      n -= values[i];
    }
  }
  
  return result;
}

/**
 * Convert number to uppercase Roman numerals (I, II, III, IV, V, ...)
 */
export function upperRoman(num: number): string {
  if (num < 1) return '';
  if (num > 3999) return num.toString(); // Roman numerals don't go beyond 3999
  
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  
  let result = '';
  let n = num;
  
  for (let i = 0; i < values.length; i++) {
    while (n >= values[i]) {
      result += numerals[i];
      n -= values[i];
    }
  }
  
  return result;
}

/**
 * Convert number to ordinal format (1st, 2nd, 3rd, 4th, ...)
 */
export function ordinal(num: number): string {
  if (num < 1) return '';
  
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  // Handle special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }
  
  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Convert number to cardinal text (one, two, three, four, ...)
 */
export function cardinalText(num: number): string {
  if (num < 1) return '';
  if (num > 999) return num.toString(); // Only handle up to 999 in text
  
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 
                'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 
                'seventeen', 'eighteen', 'nineteen'];
  
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const hundreds = ['', 'one hundred', 'two hundred', 'three hundred', 'four hundred', 
                    'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'];
  
  if (num < 20) {
    return ones[num];
  } else if (num < 100) {
    const tensDigit = Math.floor(num / 10);
    const onesDigit = num % 10;
    return tens[tensDigit] + (onesDigit > 0 ? '-' + ones[onesDigit] : '');
  } else {
    const hundredsDigit = Math.floor(num / 100);
    const remainder = num % 100;
    let result = hundreds[hundredsDigit];
    
    if (remainder > 0) {
      result += ' ' + cardinalText(remainder);
    }
    
    return result;
  }
}

/**
 * Convert number to ordinal text (first, second, third, fourth, ...)
 */
export function ordinalText(num: number): string {
  if (num < 1) return '';
  if (num > 999) return ordinal(num); // Fall back to numeric ordinal for large numbers
  
  const ordinals = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 
                    'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 
                    'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 
                    'nineteenth'];
  
  const ordinalTens = ['', '', 'twentieth', 'thirtieth', 'fortieth', 'fiftieth', 'sixtieth', 
                       'seventieth', 'eightieth', 'ninetieth'];
  
  if (num < 20) {
    return ordinals[num];
  } else if (num < 100) {
    const tensDigit = Math.floor(num / 10);
    const onesDigit = num % 10;
    
    if (onesDigit === 0) {
      return ordinalTens[tensDigit];
    } else {
      const tensText = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      return tensText[tensDigit] + '-' + ordinals[onesDigit];
    }
  } else {
    const hundredsDigit = Math.floor(num / 100);
    const remainder = num % 100;
    
    let result = cardinalText(hundredsDigit) + ' hundred';
    
    if (remainder === 0) {
      result += 'th';
    } else {
      result += ' ' + ordinalText(remainder);
    }
    
    return result;
  }
}

/**
 * Return bullet symbol
 */
export function bullet(_num: number): string {
  return '•'; // Standard bullet point - number is ignored for bullets
}

/**
 * Standard decimal numbering (1, 2, 3, 4, ...)
 */
export function decimal(num: number): string {
  return num.toString();
}

/**
 * Get numbering text based on scheme and number
 */
export function getNumberingText(num: number, scheme: NumberingScheme): string {
  switch (scheme) {
    case 'lowerLetter':
      return lowerLetter(num);
    case 'upperLetter':
      return upperLetter(num);
    case 'lowerRoman':
      return lowerRoman(num);
    case 'upperRoman':
      return upperRoman(num);
    case 'ordinal':
      return ordinal(num);
    case 'cardinalText':
      return cardinalText(num);
    case 'ordinalText':
      return ordinalText(num);
    case 'bullet':
      return bullet(num);
    case 'decimal':
    default:
      return decimal(num);
  }
}

/**
 * Counter for tracking paragraph numbering at different levels
 */
export interface NumberingCounter {
  counters: number[]; // Array of counters for different indentation levels
  maxLevel: number;   // Maximum level encountered
}

/**
 * Create a new numbering counter
 */
export function createNumberingCounter(): NumberingCounter {
  return {
    counters: [],
    maxLevel: 0
  };
}

/**
 * Increment counter at the specified level and reset deeper levels
 */
export function incrementCounter(counter: NumberingCounter, level: number): number {
  // Ensure we have enough counter slots
  while (counter.counters.length <= level) {
    counter.counters.push(0);
  }
  
  // Update max level
  counter.maxLevel = Math.max(counter.maxLevel, level);
  
  // Increment the counter at the current level
  counter.counters[level]++;
  
  // Reset all deeper levels to 0
  for (let i = level + 1; i < counter.counters.length; i++) {
    counter.counters[i] = 0;
  }
  
  return counter.counters[level];
}

/**
 * Get current counter value at the specified level
 */
export function getCounterValue(counter: NumberingCounter, level: number): number {
  if (level < 0 || level >= counter.counters.length) {
    return 0;
  }
  return counter.counters[level];
}

/**
 * Collection of numbering counters keyed by numbering ID
 */
export interface NumberingCounters {
  [numId: string]: NumberingCounter;
}

/**
 * Create a new numbering counters collection
 */
export function createNumberingCounters(): NumberingCounters {
  return {};
}

/**
 * Get or create a counter for the specified numbering ID
 */
export function getOrCreateCounter(counters: NumberingCounters, numId: string): NumberingCounter {
  if (!counters[numId]) {
    counters[numId] = createNumberingCounter();
  }
  return counters[numId];
}