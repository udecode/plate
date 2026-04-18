---
"@platejs/math": major
---

Remove deprecated `MathInputPlugin` and `BaseMathInputPlugin`

**Migration:** Move rich-mode math typing onto `AutoformatPlugin`:

```tsx
import { autoformatMathInput, AutoformatPlugin } from '@platejs/autoformat';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

const editor = createPlateEditor({
  plugins: [
    AutoformatPlugin.configure({
      options: {
        ...autoformatMathInput,
      },
    }),
    EquationPlugin,
    InlineEquationPlugin,
  ],
});
```
