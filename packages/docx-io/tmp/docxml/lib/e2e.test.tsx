/** @jsx jsx */
import { describe, it } from 'std/testing/bdd';

import Docx, {
	// deno-lint-ignore verbatim-module-syntax
	jsx,
	Paragraph,
	RelationshipType,
	Section,
	Text,
	twip,
} from '../mod.ts';
import { QNS } from './utilities/src/namespaces.ts';
import {
	expectDocumentToContain,
	expectDocxToContain,
} from './utilities/src/tests.ts';

describe('End-to-end', () => {
	describe('Text run formatting', () => {
		const docx = Docx.fromJsx(
			<Section>
				<Paragraph>
					<Text>Normal text</Text>
					<Text color="red">Colored text</Text>
					<Text isItalic>Italic text</Text>
					<Text isBold>Bold text</Text>
					<Text isUnderlined>Underlined default text</Text>
					<Text isUnderlined="wave">Underlined wave text</Text>
					<Text language="nl-NL">Buitenlandse tekst</Text>
				</Paragraph>
			</Section>
		);

		it('Unformatted', () =>
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Normal text"]/${QNS.w}rPr
					return not($rpr)
				`
			));

		it('Color', () =>
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Colored text"]/${QNS.w}rPr
					return $rpr/${QNS.w}color/@${QNS.w}val = 'red'
				`
			));

		it('Italic', () =>
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Italic text"]/${QNS.w}rPr
					return $rpr/(not(${QNS.w}b) and ${QNS.w}i)
				`
			));

		it('Bold', () =>
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Bold text"]/${QNS.w}rPr
					return $rpr/(${QNS.w}b and not(${QNS.w}i))
				`
			));

		it('Underlined', () => {
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Underlined default text"]/${QNS.w}rPr
					return $rpr/${QNS.w}u/@${QNS.w}val = 'single'
				`
			);
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Underlined wave text"]/${QNS.w}rPr
					return $rpr/${QNS.w}u/@${QNS.w}val = 'wave'
				`
			);
		});

		it('Language', () =>
			expectDocxToContain(
				docx,
				RelationshipType.officeDocument,
				`
					let $rpr := //${QNS.w}r[child::${QNS.w}t = "Buitenlandse tekst"]/${QNS.w}rPr
					return $rpr/${QNS.w}lang/@${QNS.w}val = "nl-NL"
				`
			));
	});
	describe('Paragraph style', () => {
		const docx = Docx.fromNothing();
		const name = docx.document.styles.add({
			type: 'paragraph',
			id: 'test',
			paragraph: {
				indentation: {
					firstLine: twip(420),
				},
			},
		});

		it('Indentation', () =>
			expectDocumentToContain(
				docx,
				RelationshipType.styles,
				`
					let $ppr := /*/${QNS.w}style[@${QNS.w}styleId = "${name}"]/${QNS.w}pPr
					return boolean($ppr/${QNS.w}ind/@${QNS.w}firstLine = "420")
				`
			));
	});
});
