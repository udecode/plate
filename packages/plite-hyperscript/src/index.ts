import { createHyperscript } from './hyperscript';

/**
 * The default hyperscript factory that ships with Plite, without custom tags.
 */

const jsx = createHyperscript();

export { createEditor, createEditorFixture, createText } from './creators';
export type { HyperscriptEditorFixture } from './creators';
export type { HyperscriptCreators, HyperscriptShorthands } from './hyperscript';
export { createHyperscript } from './hyperscript';
export { jsx };
