import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Cell, Paragraph, Row, Table, Text } from '../../../../mod.ts';
import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

const date = new Date();
const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Cell Deletion', () => {
	const tableNode = create(
		`<w:tbl xmlns:w="${NamespaceUri.w}">
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:cellDel w:id="1" w:author="Carlos" w:date="${date.toISOString()}"/>
                    </w:tcPr>
                    <w:p><w:r><w:t xml:space="preserve">Bye1!</w:t></w:r></w:p>
                </w:tc>
                <w:tc>
                    <w:tcPr>
                        <w:cellDel w:id="2"/>
                    </w:tcPr>
                    <w:p><w:r><w:t xml:space="preserve">Bye2!</w:t></w:r></w:p>
                </w:tc>
            </w:tr>
        </w:tbl>`,
		emptyContext
	);

	const tableObject = new Table(
		{},
		new Row(
			{},
			new Cell(
				{ deletion: { id: 1, author: 'Carlos', date } },
				new Paragraph({}, new Text({}, 'Bye1!'))
			),
			new Cell(
				{ deletion: { id: 2 } },
				new Paragraph({}, new Text({}, 'Bye2!'))
			)
		)
	);

	const tableFromNode = Table.fromNode(tableNode, emptyContext)!;

	it('parses <cellDel> into cell props', () => {
		const [firstRow] = tableFromNode.children;
		const [delCell1, delCell2] = firstRow.children as Cell[];

		expect(delCell1.props.deletion).toEqual({
			id: 1,
			author: 'Carlos',
			date,
		});
		expect(delCell2.props.deletion).toEqual({
			id: 2,
		});
	});

	it('serialises and deserialises correctly', async () => {
		const generated = serialize(await tableObject.toNode([]));

		const expected = serialize(
			create(
				`<tbl xmlns="${NamespaceUri.w}">
                    <tblPr/>
                    <tr>
                        <tc>
                            <tcPr>
                                <cellDel xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Carlos" ns1:date="${date.toISOString()}"/>
                            </tcPr>
                            <p>
                                <r>
                                    <t xml:space="preserve">Bye1!</t>
                                </r>
                            </p>
                        </tc>
                        <tc>
                            <tcPr>
                                <cellDel xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2"/>
                            </tcPr>
                            <p>
                                <r>
                                    <t xml:space="preserve">Bye2!</t>
                                </r>
                            </p>
                        </tc>
                    </tr>
                </tbl>`
			)
		);

		expect(generated).toEqual(expected);
	});
});
