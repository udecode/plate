// deno-lint-ignore-file jsx-key
/** @jsx Docx.jsx */

import Docx, {
	FieldDefinition,
	FieldNames,
	FieldRangeEnd,
	FieldRangeInstruction,
	FieldRangeSeparator,
	FieldRangeStart,
	Paragraph,
	Section,
	Text,
} from '../mod.ts';

const docx = Docx.fromNothing();

/**
 * While there is no dedicated API for field codes (yet), we can support them in docxml. The following example uses the HYPERLINK field to create a hyperlink to the google.com home page, with the visible link text "This is my text."
 */
docx.document.set([
	<Section>
		<Paragraph>
			<FieldRangeStart />
			<Text>
				<FieldRangeInstruction>
					<FieldDefinition
						name={FieldNames.HYPERLINK}
						value="http://www.google.com"
					/>
				</FieldRangeInstruction>
				<FieldRangeSeparator />
				This is my text.
			</Text>
			<FieldRangeEnd />
		</Paragraph>
	</Section>,
]);

docx.toFile('fields.docx');
