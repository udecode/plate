/** @jsx Docx.jsx */
import Docx, {
	Comment,
	CommentRangeEnd,
	CommentRangeStart,
	Paragraph,
} from '../mod.ts';

const docx = Docx.fromNothing();

docx.document.styles.add({
	id: 'CommentReference',
	type: 'character',
	paragraph: {},
});

const comment = docx.document.comments.add(
	{
		author: 'Wybe',
		date: new Date(),
		initials: 'X',
	},
	<Paragraph>According to some</Paragraph>
);

const reply = docx.document.comments.add(
	{
		author: 'Angel',
		date: new Date(),
		parentId: comment,
	},
	<Paragraph>I agree!</Paragraph>
);

const reply2 = docx.document.comments.add(
	{
		author: 'Roy',
		date: new Date(),
		parentId: comment,
	},
	<Paragraph>I don't!</Paragraph>
);

docx.document.set(
	<Paragraph>
		NSYNC is the
		<CommentRangeStart id={comment} />
		<CommentRangeStart id={reply} />
		<CommentRangeStart id={reply2} />
		greatest
		<Comment id={comment} />
		<Comment id={reply} />
		<Comment id={reply2} />
		<CommentRangeEnd id={comment} />
		<CommentRangeEnd id={reply} />
		<CommentRangeEnd id={reply2} />
		band in history.
	</Paragraph>
);

await docx.toFile('comments.docx');
