/** @jsx  Docx.jsx */
import Docx, {
	MoveFrom,
	MoveFromRangeEnd,
	MoveFromRangeStart,
	MoveTo,
	MoveToRangeEnd,
	MoveToRangeStart,
	Paragraph,
	Section,
	Text,
} from '../../../mod.ts';

const date = new Date();
const author = 'Lorca';

await Docx.fromJsx(
	<Section>
		{/* Paragraph MoveFrom */}
		<Paragraph
			pilcrow={{
				moveFrom: { id: 0, author: author, date: date },
			}}
		>
			<MoveFromRangeStart
				id={1}
				name="move_0"
				author={author}
				date={date}
			/>
			<MoveFrom id={2} author={author} date={date}>
				<Text>
					The House of Bernarda Alba is a tragedy by Federico García
					Lorca, set in a small, traditional Andalusian village in
					southern Spain, just before the Spanish Civil War. The play
					centers on Bernarda Alba, a wealthy, authoritarian widow
					who, after the death of her second husband, imposes an
					eight-year mourning period on her five daughters: Angustias
					(39), Magdalena (30), Amelia (27), Martirio (24), and Adela
					(20).
				</Text>
			</MoveFrom>
			<MoveFromRangeEnd id={1} />
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
				having a secret affair with Adela, the youngest daughter.
			</Text>
		</Paragraph>
		{/* Paragraph MoveTo */}
		<Paragraph
			pilcrow={{
				moveTo: { id: 3, author: author, date: date },
			}}
		>
			<MoveToRangeStart
				id={4}
				name="move_0"
				author={author}
				date={date}
			/>
			<MoveTo id={5} author={author} date={date}>
				<Text>
					The House of Bernarda Alba is a tragedy by Federico García
					Lorca, set in a small, traditional Andalusian village in
					southern Spain, just before the Spanish Civil War. The play
					centers on Bernarda Alba, a wealthy, authoritarian widow
					who, after the death of her second husband, imposes an
					eight-year mourning period on her five daughters: Angustias
					(39), Magdalena (30), Amelia (27), Martirio (24), and Adela
					(20).
				</Text>
			</MoveTo>
			<MoveToRangeEnd id={4} />
		</Paragraph>
		<Paragraph>
			<Text>
				As tension escalates, the household servants Poncia and the Maid
				observe the emotional conflict and attempt to warn Bernarda, who
				remains focused on maintaining appearances and family honor. Her
				elderly mother, María Josefa, expresses a longing for freedom
				that reflects the daughters' suppressed desires. Eventually,
				Martirio—also emotionally affected—reveals Adela’s relationship
				with Pepe. Bernarda tries to intervene, but the situation
				spirals. Believing Pepe is dead, Adela takes her own life.
				Bernarda responds by denying the truth and insisting on silence
				to preserve the family's reputation. The play ends with a
				powerful reflection on repression, tradition, and the
				consequences of silencing individuality.
			</Text>
		</Paragraph>
	</Section>
).toFile('track-changes-move-paragraph.docx');
