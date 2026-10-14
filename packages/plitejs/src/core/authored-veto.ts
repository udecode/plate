import { definePluginPoint } from './plugin-point';

/**
 * The reason Suggesting cannot hold a change that touches `element`, such as
 * `'table'`, or null. A feature whose blocks review marks cannot hold yet
 * contributes one, and drops it once they can.
 */
export type AuthoredVeto = (
  element: Readonly<Record<string, unknown>>
) => string | null;

/** Contribute a reason Suggesting refuses a change that touches an element. */
export const authoredVeto = definePluginPoint<AuthoredVeto>('authored.veto');
