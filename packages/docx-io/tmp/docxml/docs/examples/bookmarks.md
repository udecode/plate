To cross-reference other parts of the document you need to use the `<Hyperlink>` component, and point it to either an `anchor` or a `bookmark`.

[👉 Read more about hyperlinking external content instead](hyperlinks.md)

### Bookmark ranges

For referencing specific content, you'll need to create a custom bookmark;

1. Create a bookmark object first.
2. Associate the bookmark object with a range in the document using `<BookmarkRangeStart>` and `<BookmarkRangeEnd>`
3. Reference the bookmark object using `<Hyperlink>`'s `bookmark` prop.

```tsx
/** @jsx Docx.jsx */

import Docx, {
	BookmarkRangeEnd,
	BookmarkRangeStart,
	Hyperlink,
	Paragraph,
	Section,
	Text,
} from 'docxml';

const docx = Docx.fromNothing();

// Create a bookmark object
const bookmark = docx.bookmarks.create();

docx.document.set([
	// Associate the bookmark object with a range in the document:
	<Section pageOrientation={'landscape'}>
		<BookmarkRangeStart bookmark={bookmark} />
		<Paragraph>
			<Text>This is the content that is being referenced.</Text>
		</Paragraph>
		<BookmarkRangeEnd bookmark={bookmark} />
	</Section>,
	// Reference the bookmark using a hyperlink
	<Section pageOrientation={'portrait'}>
		<Paragraph>
			<Hyperlink bookmark={bookmark}>
				<Text>This is a cross-reference to the next section</Text>
			</Hyperlink>
		</Paragraph>
	</Section>,
]);

docx.toFile('hyperlinks.docx');
```

### Reference anchors

There are a few anchors pre-defined:

- `"_top"`
- More???

These anchor(s) can be referenced with the `anchor` prop:

```tsx
<Hyperlink anchor="_top">
	<Text>Go to top</Text>
</Hyperlink>
```
