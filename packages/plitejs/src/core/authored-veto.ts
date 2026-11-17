import { definePluginPoint } from './plugin-point';

/**
 * How a change touches an element that a veto reads:
 *
 * - `'content'`: it edits only what the element holds.
 * - `'whole'`: the element is the outermost one the change inserts or removes.
 * - `'inside'`: the change inserts or removes the element inside a `'whole'`
 *   one.
 * - `'properties'`: it sets or unsets the element's properties, a retype
 *   included.
 * - `'boundary'`: it splits, joins, wraps or unwraps the element, or cuts
 *   through it.
 */
export type AuthoredTouch =
  | 'boundary'
  | 'content'
  | 'inside'
  | 'properties'
  | 'whole';

/**
 * The reason Suggesting cannot hold a change that touches `element`, such as
 * `'table'`, or null. A feature whose blocks review marks cannot hold yet
 * contributes one, and drops it once they can. A `'properties'` touch reads
 * the element's properties both before and after the change.
 */
export type AuthoredVeto = (
  element: Readonly<Record<string, unknown>>,
  touch: AuthoredTouch
) => string | null;

/** Contribute a reason Suggesting refuses a change that touches an element. */
export const authoredVeto = definePluginPoint<AuthoredVeto>('authored.veto');
