### Starting from nothing

To create a document from _nothing_ is the most straight-forward way to use `docxml`. This creates
a new document entirely devoid of content, styles, relationships, headers/footers, bookmarks and so
on.

```tsx
/** @jsx Docx.jsx */
import Docx, { Paragraph, Text } from 'docxml';

const docx = Docx.fromNothing();
```

Or, if you already know what should go in your document;

```tsx
const docx = Docx.fromJsx(<Paragraph>Hello world!</Paragraph>);
```

The `docx` instance from the example above provides access to some interesting helper classes that
are roughly organised in the way that a DOCX archive is itself;

- `docx.bookmarks` to add bookmarks that can be shared between ranges and links.
  [Read more about cross-referencing to bookmarks](../examples/bookmarks.md).
- `docx.document` to control the document contents, and relationships directly to `word/document.xml`
  - `docx.document.styles` to read/write custom style definitions
  - `docx.document.numbering` to read/write list numbering schemes. [Read more about creating lists and numbering](../examples/lists.md).
  - `docx.document.settings` to read or write `settings.xml`
  - `docx.document.headers` and `docx.document.headers` to add those things. [Read more about setting page headers and footers](../examples/headers-and-footers.md).

### Starting from a file

For all intents and purposes a `.dotx` template file is the same as the `.docx` document instance. You can instantiate
`docxml` from them:

```tsx
const docx = Docx.fromArchive('my-template.dotx');
```

The `docx` instance that returns can be used in all the same ways as if you were to instantiate `docxml` in another way,
but it'll be prepopulated with all the styles, numberings, headers/footers, settings, document contents, etc. that already
were in your file.
