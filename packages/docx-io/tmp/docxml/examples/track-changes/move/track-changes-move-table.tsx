/** @jsx  Docx.jsx */
import Docx, {
	Cell,
	MoveFrom,
	MoveFromRangeEnd,
	MoveFromRangeStart,
	MoveToRangeEnd,
	MoveToRangeStart,
	MoveTo,
	Paragraph,
	Row,
	Section,
	Table,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

await Docx.fromJsx(
	<Section>
		{/* Table MoveTo */}
		<Table>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 15,
								author: author,
								date: date,
							},
						}}
					>
						<MoveToRangeStart
							id={16}
							name="move_2"
							author={author}
							date={date}
						/>
						<MoveTo id={17} author={author} date={date}>
							<Text> Author</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 45,
								author: author,
								date: date,
							},
						}}
					>
						<MoveTo id={46} author={author} date={date}>
							<Text>Federico García Lorca</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 47,
								author: author,
								date: date,
							},
						}}
					>
						<MoveTo id={48} author={author} date={date}>
							<Text>Genre</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 49,
								author: author,
								date: date,
							},
						}}
					>
						<MoveTo id={50} author={author} date={date}>
							<Text>Tragedy</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 51,
								author: author,
								date: date,
							},
						}}
					>
						<MoveTo id={52} author={author} date={date}>
							<Text>Message</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveTo: {
								id: 53,
								author: author,
								date: date,
							},
						}}
					>
						<MoveTo id={54} author={author} date={date}>
							<Text>
								Critique of social and familial repression,
								especially against women
							</Text>
						</MoveTo>
					</Paragraph>
				</Cell>
			</Row>
		</Table>
		<MoveToRangeEnd id={16} />
		<Paragraph>
			<Text isBold isCaps>
				Summary Table
			</Text>
		</Paragraph>
		{/* Table MoveFrom */}
		<Table>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 12,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFromRangeStart
							id={13}
							name="move_2"
							author={author}
							date={date}
						/>
						<MoveFrom id={14} author={author} date={date}>
							<Text> Author</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 35,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFrom id={36} author={author} date={date}>
							<Text>Federico García Lorca</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 37,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFrom id={38} author={author} date={date}>
							<Text>Genre</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 39,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFrom id={40} author={author} date={date}>
							<Text>Tragedy</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 41,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFrom id={42} author={author} date={date}>
							<Text>Message</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
				<Cell>
					<Paragraph
						pilcrow={{
							moveFrom: {
								id: 43,
								author: author,
								date: date,
							},
						}}
					>
						<MoveFrom id={44} author={author} date={date}>
							<Text>
								Critique of social and familial repression,
								especially against women
							</Text>
						</MoveFrom>
					</Paragraph>
				</Cell>
			</Row>
		</Table>
		<MoveFromRangeEnd id={13} />
	</Section>
).toFile('track-changes-move-table.docx');
