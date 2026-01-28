/** @jsx  Docx.jsx */
import Docx, { Paragraph, Section, Text } from '../../mod.ts';

await Docx.fromJsx(
	<Section>
		<Paragraph>
			{/* Text formatted to not bold */}
			<Text
				change={{
					author: 'Gabe',
					id: 22,
					date: new Date(),
					isBold: true,
				}}
			>
				Finally, from so little sleeping and so much reading, his brain
				dried up and he went completely out of his mind.
			</Text>
		</Paragraph>
		<Paragraph>
			{/* Text formatted to bold */}
			<Text
				isBold
				change={{
					author: 'Gabe',
					id: 22,
					date: new Date(),
				}}
			>
				To change the world, my friend Sancho, is not madness nor
				utopia, but justice.
			</Text>
		</Paragraph>
		<Paragraph>
			{/* Italic text formatted to not bold */}
			<Text
				isItalic
				change={{
					author: 'Gabe',
					id: 22,
					date: new Date(),
					isBold: true,
					isItalic: true,
				}}
			>
				Life is a dream, and dreams are just dreams.
			</Text>
		</Paragraph>
		<Paragraph>
			{/* Text formatted to italic and not bold */}
			<Text
				isItalic
				change={{
					author: 'Gabe',
					id: 22,
					date: new Date(),
					isBold: true,
				}}
			>
				Youth, the flower of the day.
			</Text>
		</Paragraph>
	</Section>
).toFile('track-changes-change.docx');
