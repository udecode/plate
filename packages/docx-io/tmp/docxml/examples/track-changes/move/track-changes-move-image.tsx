/** @jsx  Docx.jsx */
import Docx, {
	cm,
	Image,
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

await Docx.fromJsx(
	<Section>
		{/* Image MoveTo */}
		<Paragraph>
			<MoveToRangeStart
				id={11}
				name="move_1"
				author={author}
				date={date}
			/>
			<MoveTo id={12} author={author} date={date}>
				<Text>
					<Image
						data={Deno.readFile('assets/oldPhoto.jpg')}
						width={cm(6)}
						height={cm(8)}
						title="Title"
						alt="Description"
					/>
				</Text>
			</MoveTo>
			<MoveToRangeEnd id={11} />
		</Paragraph>
		<Paragraph>
			<Text isBold isCaps>
				Old picture
			</Text>
		</Paragraph>
		{/* Image MoveFrom */}
		<Paragraph>
			<MoveFromRangeStart
				id={8}
				name="move_1"
				author={author}
				date={date}
			/>
			<MoveFrom id={9} author={author} date={date}>
				<Text>
					<Image
						data={Deno.readFile('assets/oldPhoto.jpg')}
						width={cm(6)}
						height={cm(8)}
						title="Title"
						alt="Description"
					/>
				</Text>
			</MoveFrom>
			<MoveFromRangeEnd id={8} />
		</Paragraph>
	</Section>
).toFile('track-changes-move-image.docx');
