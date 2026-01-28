Comments work through registering a comment via the `Docx.document.comments` instance. A comment has an author, author initials, date, and one `Paragraph` of content.

```ts
/** @jsx Docx.jsx */
import Docx, { Comment, CommentRangeEnd, CommentRangeStart, Paragraph } from 'docxml';

const docx = Docx.fromNothing();

const comment = docx.document.comments.add(
	{
		author: 'Wybe',
		date: new Date(),
		initials: 'X',
	},
	<Paragraph>According to some</Paragraph>,
);

docx.document.set(
	<Paragraph>
		NSYNC is the <CommentRangeStart id={comment} />
		<Comment id={comment} />
		greatest
		<CommentRangeEnd id={comment} /> band in history.
	</Paragraph>,
);

await docx.toFile('comments.docx');
```

The `docx.document.comments.add` function then returns a new unique identifier that you can use in any of the components that relate the comment to a specific place in the document. Be careful to use `<Comment>` and optionally `<CommentRangeStart>` and `<CommentRangeEnd>` for every comment exactly _once_ -- more will result in MS Word refusing to open the file.
