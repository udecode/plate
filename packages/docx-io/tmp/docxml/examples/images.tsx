/** @jsx Docx.jsx */
import Docx, { cm, Image, Paragraph, Section, Text } from '../mod.ts';

await Docx.fromJsx(
	<Section>
		<Paragraph>
			<Text>
				<Image
					data={Deno.readFile('assets/spacekees.jpeg')}
					width={cm(16)}
					height={cm(16)}
					title="Title"
					alt="Description"
				/>
			</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				Next image will look different if your word processor supports
				SVG.
			</Text>
		</Paragraph>
		<Paragraph>
			<Text>
				<Image
					data={Deno.readFile('assets/spacekees.jpeg')}
					dataExtensions={{
						svg: Deno.readTextFile('assets/git.svg'),
					}}
					width={cm(16)}
					height={cm(16)}
					title="Title"
					alt="Description"
				/>
			</Text>
		</Paragraph>
	</Section>
).toFile('images.docx');
