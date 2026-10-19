import { definePluginPoint } from '../../../facade';

/**
 * Contribute an element type inside which no input rule runs, such as a code
 * block whose text must stay as typed.
 */
export const inputRuleVeto = definePluginPoint<string>('input-rules.veto');
