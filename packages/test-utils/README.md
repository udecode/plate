# Plate test utilities

Use the Plate JSX factory to build typed document fixtures:

```tsx
import { jsxt, type TestEditor } from '@platejs/test-utils';

const fixture = (
  <editor>
    <hp>Hello</hp>
  </editor>
) as TestEditor;
```

The package also exports `createEditorFromFixture` and `createDataTransfer` for
editor and clipboard tests.

## License

[MIT](../../LICENSE)
