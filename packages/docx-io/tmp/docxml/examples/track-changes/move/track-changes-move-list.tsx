/** @jsx  Docx.jsx */
import Docx, {
	cm,
	MoveFrom,
	MoveFromRangeEnd,
	MoveFromRangeStart,
	MoveToRangeEnd,
	MoveToRangeStart,
	MoveTo,
	Paragraph,
	Section,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

const api = Docx.fromNothing();
const numbering = api.document.numbering.add({
	type: 'hybridMultilevel',
	levels: [
		{
			alignment: 'left',
			format: 'decimalZero',
			start: 1,
			affix: '%1',
		},
		{
			alignment: 'left',
			format: 'lowerRoman',
			start: 1,
			affix: '%1',
			paragraph: {
				indentation: {
					start: cm(1),
				},
				shading: {
					background: 'yellow',
				},
			},
		},
		{
			alignment: 'left',
			format: 'lowerLetter',
			start: 1,
			affix: '%1',
			paragraph: {
				indentation: {
					start: cm(2),
				},
			},
		},
	],
});

await Docx.fromJsx(
	<Section>
		{/* List MoveTo */}
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				moveTo: { id: 26, author: author, date: date },
			}}
		>
			<MoveToRangeStart
				id={27}
				name="move_3"
				author={author}
				date={date}
			/>
			<MoveTo id={28} author={author} date={date}>
				<Text>
					The play is set in a house in Andalusia, shortly before the
					Spanish Civil War.
				</Text>
			</MoveTo>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				moveTo: { id: 29, author: author, date: date },
			}}
		>
			<MoveTo id={30} author={author} date={date}>
				<Text>
					Bernarda Alba imposes an eight-year mourning period after
					her husband’s death.
				</Text>
			</MoveTo>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 1 }}
			pilcrow={{
				moveTo: { id: 31, author: author, date: date },
			}}
		>
			<MoveTo id={32} author={author} date={date}>
				<Text>Uses mourning to control her daughters</Text>
			</MoveTo>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 2 }}
			pilcrow={{
				moveTo: { id: 33, author: author, date: date },
			}}
		>
			<MoveTo id={34} author={author} date={date}>
				<Text>No courtship or social contact allowed</Text>
			</MoveTo>
		</Paragraph>
		<MoveToRangeEnd id={27} />

		<Paragraph>
			<Text>Key Points List</Text>
		</Paragraph>

		{/* List MoveFrom */}
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				moveFrom: { id: 17, author: author, date: date },
			}}
		>
			<MoveFromRangeStart
				id={18}
				name="move_3"
				author={author}
				date={date}
			/>
			<MoveFrom id={19} author={author} date={date}>
				<Text>
					The play is set in a house in Andalusia, shortly before the
					Spanish Civil War.
				</Text>
			</MoveFrom>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{
				moveFrom: { id: 20, author: author, date: date },
			}}
		>
			<MoveFrom id={21} author={author} date={date}>
				<Text>
					Bernarda Alba imposes an eight-year mourning period after
					her husband’s death.
				</Text>
			</MoveFrom>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 1 }}
			pilcrow={{
				moveFrom: { id: 22, author: author, date: date },
			}}
		>
			<MoveFrom id={23} author={author} date={date}>
				<Text>Uses mourning to control her daughters</Text>
			</MoveFrom>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 2 }}
			pilcrow={{
				moveFrom: { id: 24, author: author, date: date },
			}}
		>
			<MoveFrom id={25} author={author} date={date}>
				<Text>No courtship or social contact allowed</Text>
			</MoveFrom>
		</Paragraph>
		<MoveFromRangeEnd id={18} />
	</Section>
).toFile('track-changes-move-list.docx');
