import { defineWorkspace } from 'vitest/config';

// There are more vite.config.js files than we want to include here (ie: examples folder)
// Include only the relevant ones
export default defineWorkspace(['./packages/super-editor/vite.config.js', './packages/superdoc/vite.config.js']);
