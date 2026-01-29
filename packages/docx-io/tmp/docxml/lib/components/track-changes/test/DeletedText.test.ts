import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { DeletedText } from "../src/DeletedText.ts";

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Deleted Text', () => {
	const deletedText = DeletedText.fromNode(
		create(`
			<w:r xmlns:w="${NamespaceUri.w}">
				<w:rPr>
					<w:b />
				</w:rPr>
				<w:delText>This text contains</w:delText>
				<w:br w:type="page" />
				<w:delText>a page break</w:delText>
			</w:r>
		`),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(deletedText.props.isBold).toBeTruthy();
	});

	it('parses children correctly', () => {
		expect(deletedText.children).toHaveLength(3);
		expect(deletedText.children.map((child) => child.constructor.name)).toEqual([
			'String',
			'Break',
			'String',
		]);
	});

	it('serializes correctly', async () => {
		expect(serialize(await deletedText.toNode([]))).toBe(
			`
				<r xmlns="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					<rPr><b/></rPr>
					<delText xml:space="preserve">This text contains</delText>
					<br xmlns:ns1="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ns1:type="page"/>
					<delText xml:space="preserve">a page break</delText>
				</r>
			`.replace(/\n|\t/g, '')
		);
	});
});
