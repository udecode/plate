/** @jsx  Docx.jsx */
import Docx, {
	Cell,
	cm,
	DeletedText,
	Deletion,
	Image,
	Paragraph,
	Row,
	Section,
	Table,
	Text,
} from '../../mod.ts';

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
		{/* Paragraph deletion */}
		<Paragraph
			pilcrow={{ deletion: { id: 1, author: author, date: date } }}
		>
			<Deletion id={2} author={author} date={date}>
				<DeletedText>
					The House of Bernarda Alba is a tragedy by Federico García
					Lorca, set in a small, traditional Andalusian village in
					southern Spain, just before the Spanish Civil War. The play
					centers on Bernarda Alba, a wealthy, authoritarian widow
					who, after the death of her second husband, imposes an
					eight-year mourning period on her five daughters: Angustias
					(39), Magdalena (30), Amelia (27), Martirio (24), and Adela
					(20).
				</DeletedText>
			</Deletion>
		</Paragraph>
		<Paragraph>
			<Text>
				Confined within the white, claustrophobic walls of their home,
				the daughters are stripped of their freedom and individuality,
				oppressed by both their mother's tyranny and a society that
				dictates strict roles for women. They become increasingly
				frustrated and emotionally unstable, especially when it becomes
				known that Pepe el Romano, the only eligible bachelor in the
				area, plans to marry Angustias, the eldest and wealthiest
				daughter. However, it is soon revealed that Pepe is only
				interested in Angustias for her inheritance, and he is actually
				having a secret affair with Adela,
			</Text>
			{/* Text deletion */}
			<Deletion id={3} author={author} date={date}>
				<DeletedText> the youngest daughter.</DeletedText>
			</Deletion>
		</Paragraph>
		<Paragraph>
			{/* Text with inline styles deletion */}
			<Deletion id={4} author={author} date={date}>
				<DeletedText isItalic isBold>
					As tension escalates,{' '}
				</DeletedText>
			</Deletion>
			<Text>
				the household servants Poncia and the Maid observe the emotional
				conflict and attempt to warn Bernarda, who remains focused on
				maintaining appearances and family honor. Her elderly mother,
				María Josefa, expresses a longing for freedom that reflects the
				daughters' suppressed desires. Eventually, Martirio—also
				emotionally affected—reveals Adela’s relationship with Pepe.
				Bernarda tries to intervene, but the situation spirals.
				Believing Pepe is dead, Adela takes her own life. Bernarda
				responds by denying the truth and insisting on silence to
				preserve the family's reputation. The play ends with a powerful
				reflection on repression, tradition, and the consequences of
				silencing individuality.
			</Text>
		</Paragraph>

		<Paragraph>
			<Text isBold isCaps>
				Summary Table
			</Text>
		</Paragraph>
		{/* Table deletion */}
		<Table>
			<Row deletion={{ id: 5, author: author, date: new Date() }}>
				<Cell>
					<Paragraph>Author</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>Federico García Lorca</Paragraph>
				</Cell>
			</Row>
			<Row deletion={{ id: 6, author: author, date: new Date() }}>
				<Cell>
					<Paragraph>Genre</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>Tragedy</Paragraph>
				</Cell>
			</Row>
			<Row deletion={{ id: 7, author: author, date: new Date() }}>
				<Cell>
					<Paragraph>Message</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Critique of social and familial repression, especially
						against women
					</Paragraph>
				</Cell>
			</Row>
		</Table>
		<Paragraph>
			<Text isBold isCaps>
				Characters
			</Text>
		</Paragraph>
		<Table>
			{/* Header row deletion */}
			<Row
				isHeaderRow
				deletion={{ id: 8, author: author, date: new Date() }}
			>
				<Cell>
					<Paragraph>Character</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>Description</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph>Bernarda Alba</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Authoritarian widow obsessed with family honor and
						control.
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph>Angustias</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Eldest daughter (39), engaged to Pepe el Romano.
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph>Martirio</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Fourth daughter (24), secretly in love with Pepe el
						Romano.
					</Paragraph>
				</Cell>
			</Row>
			<Row>
				{/* Cell deletion */}
				<Cell deletion={{ id: 10, author: author, date: new Date() }}>
					<Paragraph>Adela</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Youngest daughter (20), rebellious and secretly involved
						with Pepe.
					</Paragraph>
				</Cell>
			</Row>
			{/* Row deletion */}
			<Row deletion={{ id: 9, author: author, date: new Date() }}>
				<Cell>
					<Paragraph>Pepe el Romano</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>
						Eligible bachelor, courting Angustias but secretly
						having an affair with Adela.
					</Paragraph>
				</Cell>
			</Row>
		</Table>

		<Paragraph>
			<Text isBold isCaps>
				Key Points List
			</Text>
		</Paragraph>

		{/* List deletion */}
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{ deletion: { id: 11, author: author, date: date } }}
		>
			<Deletion id={17} author={author} date={date}>
				<DeletedText>
					The play is set in a house in Andalusia, shortly before the
					Spanish Civil War.
				</DeletedText>
			</Deletion>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 0 }}
			pilcrow={{ deletion: { id: 12, author: author, date: date } }}
		>
			<Deletion id={18} author={author} date={date}>
				<DeletedText>
					Bernarda Alba imposes an eight-year mourning period after
					her husband’s death.
				</DeletedText>
			</Deletion>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 1 }}
			pilcrow={{ deletion: { id: 13, author: author, date: date } }}
		>
			<Deletion id={19} author={author} date={date}>
				<DeletedText>
					Uses mourning to control her daughters
				</DeletedText>
			</Deletion>
		</Paragraph>
		<Paragraph
			listItem={{ numbering, depth: 2 }}
			pilcrow={{ deletion: { id: 14, author: author, date: date } }}
		>
			<Deletion id={20} author={author} date={date}>
				<DeletedText>
					No courtship or social contact allowed
				</DeletedText>
			</Deletion>
		</Paragraph>
		{/* Image deletion */}
		<Paragraph
			pilcrow={{ deletion: { id: 15, author: author, date: date } }}
		>
			<Deletion id={16} author={author} date={date}>
				<DeletedText>
					<Image
						data={Deno.readFile('assets/oldPhoto.jpg')}
						width={cm(6)}
						height={cm(8)}
						title="Title"
						alt="Description"
					/>
				</DeletedText>
			</Deletion>
		</Paragraph>
	</Section>
).toFile('track-changes-deletion.docx');
