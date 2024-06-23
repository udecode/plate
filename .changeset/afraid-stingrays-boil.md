---
"@udecode/plate-code-block": major
---

Make the dependency on prismjs optional

New usage:

```ts
// Import Prism with your supported languages
import Prism from 'prismjs';

import 'prismjs/components/prism-antlr4.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-c.js';
// ...

const plugins = createPlugins([
  createCodeBlockPlugin({
    options: {
      prism: Prism,
    },
  }),
]);
```
