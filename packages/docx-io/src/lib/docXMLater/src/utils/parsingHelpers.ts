/**
 * Parsing Helper Functions
 *
 * Utility functions for safely parsing OOXML values from XML attributes.
 * These helpers address common parsing issues:
 * - Zero-value handling (0 should not be treated as falsy)
 * - NaN validation (malformed values should fall back to defaults)
 * - ECMA-376 boolean parsing (self-closing tags, val="1", val="true")
 *
 * @see https://ecma-international.org/publications-and-standards/standards/ecma-376/
 */

/**
 * Safely parse an integer value with NaN handling.
 *
 * Addresses the issue where parseInt() can return NaN for malformed input,
 * which then propagates through the document model causing issues.
 *
 * @param value - The value to parse (string, number, or any)
 * @param defaultValue - Default value if parsing fails (default: 0)
 * @returns Parsed integer or default value
 *
 * @example
 * safeParseInt("42")      // 42
 * safeParseInt("invalid") // 0
 * safeParseInt(undefined) // 0
 * safeParseInt("", 100)   // 100
 */
export function safeParseInt(value: unknown, defaultValue = 0): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  // If already a number, return it (handle NaN case)
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : Math.floor(value);
  }

  const parsed = Number.parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse OOXML boolean value per ECMA-376 specification.
 *
 * OOXML boolean properties follow these rules:
 * - Self-closing tag `<w:bold/>` (no w:val attribute) = true
 * - `<w:bold w:val="1"/>` = true
 * - `<w:bold w:val="true"/>` = true
 * - `<w:bold w:val="on"/>` = true
 * - `<w:bold w:val="0"/>` = false
 * - `<w:bold w:val="false"/>` = false
 * - `<w:bold w:val="off"/>` = false
 * - Absent element = false (handled by caller checking for property existence)
 *
 * @param prop - The parsed XML property object (e.g., pPrObj["w:bold"])
 * @returns Boolean value
 *
 * @example
 * // For XML: <w:bold/>
 * parseOoxmlBoolean({}) // true (self-closing, no @_w:val)
 *
 * // For XML: <w:bold w:val="1"/>
 * parseOoxmlBoolean({ "@_w:val": "1" }) // true
 *
 * // For XML: <w:bold w:val="0"/>
 * parseOoxmlBoolean({ "@_w:val": "0" }) // false
 *
 * // For absent element
 * parseOoxmlBoolean(undefined) // false
 */
export function parseOoxmlBoolean(prop: unknown): boolean {
  // Absent element = false
  if (!prop) {
    return false;
  }

  // Get the w:val attribute value
  const val = (prop as Record<string, unknown>)['@_w:val'];

  // Self-closing tag without w:val attribute = true
  // Per ECMA-376, presence of element without val means "on"
  if (val === undefined) {
    return true;
  }

  // Handle string values
  if (typeof val === 'string') {
    const lowerVal = val.toLowerCase();
    return lowerVal === '1' || lowerVal === 'true' || lowerVal === 'on';
  }

  // Handle numeric values
  if (typeof val === 'number') {
    return val === 1;
  }

  // Handle boolean values (already parsed by XML parser)
  if (typeof val === 'boolean') {
    return val;
  }

  // Unknown type - default to false
  return false;
}

/**
 * Check if a value is explicitly set (not undefined or null).
 *
 * This helper addresses the zero-value handling bug where truthy checks
 * incorrectly treat 0 as falsy:
 *
 * ```typescript
 * // WRONG - treats 0 as falsy
 * const width = val ? parseInt(val) : defaultWidth;
 *
 * // CORRECT - only checks for undefined/null
 * const width = isExplicitlySet(val) ? parseInt(val) : defaultWidth;
 * ```
 *
 * @param value - The value to check
 * @returns true if value is not undefined and not null
 *
 * @example
 * isExplicitlySet(0)         // true
 * isExplicitlySet("")        // true
 * isExplicitlySet(false)     // true
 * isExplicitlySet(undefined) // false
 * isExplicitlySet(null)      // false
 */
export function isExplicitlySet(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/**
 * Parse an OOXML numeric attribute with proper handling of zero values.
 *
 * Combines isExplicitlySet() and safeParseInt() for common use case
 * of parsing numeric attributes from XML.
 *
 * @param value - The attribute value to parse
 * @param defaultValue - Default value if attribute is not set
 * @returns Parsed integer or default value
 *
 * @example
 * parseNumericAttribute("100", 50)    // 100
 * parseNumericAttribute("0", 50)      // 0 (not 50!)
 * parseNumericAttribute(undefined, 50) // 50
 * parseNumericAttribute("invalid", 50) // 50
 */
export function parseNumericAttribute(
  value: unknown,
  defaultValue: number
): number {
  if (!isExplicitlySet(value)) {
    return defaultValue;
  }
  return safeParseInt(value, defaultValue);
}

/**
 * Parse OOXML "on/off" attribute (ST_OnOff type).
 *
 * Some OOXML attributes use the ST_OnOff simple type which can be:
 * - "on", "1", "true" = true
 * - "off", "0", "false" = false
 *
 * This is similar to parseOoxmlBoolean but works on attribute values directly.
 *
 * @param value - The attribute value
 * @param defaultValue - Default if value is not set
 * @returns Boolean value
 */
export function parseOnOffAttribute(
  value: unknown,
  defaultValue = false
): boolean {
  if (!isExplicitlySet(value)) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    const lowerVal = value.toLowerCase();
    return lowerVal === '1' || lowerVal === 'true' || lowerVal === 'on';
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return defaultValue;
}
