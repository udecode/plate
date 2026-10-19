---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the slash command plugin. `@platejs/slash-command` does not move into `platejs`. The copied `slash` registry component defines the slash menu's plugin next to its popup.

**Migration:** Remove `@platejs/slash-command`, the copied `slash-kit` that imports it, and the copied `slash-node` component. Add the registry item, and import `SlashKit` from `@/components/editor/slash` where you imported the old `slash-kit`:

```bash
npx shadcn@latest add @plate/slash
```

```tsx
import { SlashKit } from '@/components/editor/slash';

const editor = createEditor({ plugins: [...SlashKit] });
```
