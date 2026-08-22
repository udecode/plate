import type PrismType from 'prismjs';

// Prism's language modules are CommonJS scripts that read a global `Prism`
// during evaluation. Keep these requires imperative: static-import sorting can
// otherwise run a grammar before Prism or one of its grammar dependencies.
// oxlint-disable-next-line node/global-require, unicorn/prefer-module -- Prism 1.x language modules are ordered CommonJS side effects.
const Prism = require('prismjs') as typeof PrismType;

// prismjs includes markup, CSS, C-like, and JavaScript in its root bundle.
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-java');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-jsx');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-markdown');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-markup-templating');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-php');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-python');
// oxlint-disable-next-line unicorn/prefer-module -- Prism grammars must evaluate after the global Prism runtime exists.
require('prismjs/components/prism-sql');
// oxlint-disable-next-line unicorn/prefer-module -- TypeScript must evaluate before TSX.
require('prismjs/components/prism-typescript');
// oxlint-disable-next-line unicorn/prefer-module -- TSX depends on the ordered JSX and TypeScript grammars.
require('prismjs/components/prism-tsx');

export { Prism };
