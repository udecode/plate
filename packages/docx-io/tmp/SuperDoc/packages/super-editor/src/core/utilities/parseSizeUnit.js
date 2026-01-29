/**
 * Matches a CSS dimension returning a group containing the unit name
 * i.e. '10rem' returns the group 'rem'
 */
const CSS_DIMENSION_REGEX = /[\d-.]+(\w+)$/;

const DOM_SIZE_UNITS = ['px', 'rem', 'em', 'in', 'q', 'mm', 'cm', 'pt', 'pc', 'vh', 'vw', 'vmin', 'vmax'];

/**
 * Parse the size and unit from the provided value.
 * @param val Value to parse.
 * @returns Array with parsed value and unit (or null).
 */
export function parseSizeUnit(val = '0') {
  const length = val.toString() || '0';
  const value = Number.parseFloat(length);
  const match = length.match(CSS_DIMENSION_REGEX);
  const unit = (match?.[1] ?? '').toLowerCase();
  return [value, DOM_SIZE_UNITS.includes(unit) ? unit : null];
}
