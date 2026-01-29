import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Text } from '../../document/src/Text.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Text', () => {
	const text = Text.fromNode(
		create(`
			<w:r xmlns:w="${NamespaceUri.w}">
				<w:rPr>
					<w:b />
				</w:rPr>
				<w:t>This text contains</w:t>
				<w:br w:type="page" />
				<w:t>a page break</w:t>
			</w:r>
		`),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(text.props.isBold).toBeTruthy();
	});

	it('parses children correctly', () => {
		expect(text.children).toHaveLength(3);
		expect(text.children.map((child) => child.constructor.name)).toEqual([
			'String',
			'Break',
			'String',
		]);
	});

	it('serializes correctly', async () => {
		expect(serialize(await text.toNode([]))).toBe(
			`
				<r xmlns="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					<rPr><b/></rPr>
					<t xml:space="preserve">This text contains</t>
					<br xmlns:ns1="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ns1:type="page"/>
					<t xml:space="preserve">a page break</t>
				</r>
			`.replace(/\n|\t/g, '')
		);
	});
});
