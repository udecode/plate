import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Hyperlink } from '../src/Hyperlink.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Hyperlink', () => {
	const hyperlink = Hyperlink.fromNode(
		create(`
                <w:hyperlink xmlns:w="${NamespaceUri.w}" w:anchor="chapter1" w:tooltip="link">
                    <w:r>
                        <w:t>Link</w:t>
                    </w:r>
					<w:ins w:id="1">
						<w:r>
							<w:t xml:space="preserve">This is a new paragraph</w:t>
						</w:r>
					</w:ins>
					<w:del w:id="1">
						<w:r>
							<w:delText xml:space="preserve">This is removed paragraph</w:delText>
						</w:r>
					</w:del>
                </w:hyperlink>
                `),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(hyperlink.props.anchor).toBe('chapter1');
		expect(hyperlink.props.tooltip).toBe('link');
	});

	it('parses children correctly', () => {
		expect(hyperlink.children).toHaveLength(3);
	});

	it('serializes correctly', async () => {
		expect(serialize(await hyperlink.toNode([]))).toBe(
			`<hyperlink xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:anchor="chapter1" ns1:tooltip="link">
				<r><t xml:space="preserve">Link</t></r>
				<ins ns1:id="1">
					<r>
						<t xml:space="preserve">This is a new paragraph</t>
					</r>
				</ins>
				<del ns1:id="1">
					<r>
						<delText xml:space="preserve">This is removed paragraph</delText>
					</r>
				</del>
			</hyperlink>`.replace(/\t|\n/g, '')
		);
	});
});
