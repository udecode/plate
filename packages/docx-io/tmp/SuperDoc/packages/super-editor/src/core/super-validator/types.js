/** @typedef {import('../Editor.js').Editor} Editor */

/**
 * @typedef {Object} SuperValidatorOptions
 * @property {Editor} editor The editor instance to validate.
 * @property {boolean} [dryRun=false] If true, the validator will not modify the document.
 * @property {boolean} [debug=false] If true, debug information will be logged to the console.
 */

/**
 * @typedef {Object} ValidatorLogger
 * @property {function(string, ...any): void} debug - Function to log debug messages.
 * @property {function(string): ValidatorLogger} withPrefix - Function to create a new logger with an additional prefix.
 */

/**
 * @typedef {function} StateValidator
 * @param {Editor} editor - The editor instance to validate.
 * @param {ValidatorLogger} logger - Logger for validation messages.
 * @returns {{ modified: boolean, results: string[] }} - Validation results and whether the document was modified.
 */

/**
 * @typedef {Object} ElementInfo
 * @property {import('prosemirror-model').Node} [node]
 * @property {number} pos
 * @property {number} [from] - For marks
 * @property {number} [to] - For marks
 * @property {import('prosemirror-model').Mark} [mark] - For marks
 */

/**
 * @typedef {Record<string, ElementInfo[]>} DocumentAnalysis
 * @property {import('prosemirror-model').Node} node - The ProseMirror node.
 * @property {number} pos - The position of the node in the document.
 * @property {number} [from] - The start position for marks.
 * @property {number} [to] - The end position for marks.
 * @property {import('prosemirror-model').Mark} [mark] - The ProseMirror mark, if applicable.
 */

/**
 * @typedef {Object} ValidatorRequirements
 * @property {string[]} [nodes] - Node types this validator needs
 * @property {string[]} [marks] - Mark types this validator needs
 */

/** @typedef {function(import('prosemirror-state').Transaction, DocumentAnalysis): { modified: boolean, results: string[] }} ValidatorFn */

/** @typedef {ValidatorFn & { requiredElements?: ValidatorRequirements }} ValidatorFunction */

/** @typedef {Record<string, ElementInfo[]>} DocumentAnalysis */

export {};
