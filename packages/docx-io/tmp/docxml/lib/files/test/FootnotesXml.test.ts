import { expect } from 'std/expect';
import { beforeAll, describe, it } from 'std/testing/bdd';
import { Cell } from '../../components/document/src/Cell.ts';
import { Image } from '../../components/document/src/Image.ts';
import { Paragraph } from '../../components/document/src/Paragraph.ts';
import { Row } from '../../components/document/src/Row.ts';
import { Table } from '../../components/document/src/Table.ts';
import { Text } from '../../components/document/src/Text.ts';
import { serialize } from '../../utilities/src/dom.ts';
import { cm, pt } from '../../utilities/src/length.ts';
import { archive } from '../../utilities/src/tests.ts';
import { ContentTypesXml } from '../src/ContentTypesXml.ts';
import { FootnotesXml } from '../src/FootnotesXml.ts';

describe('Footnotes', () => {
	let contentTypes: ContentTypesXml;
	let footnotes: FootnotesXml;

	beforeAll(async () => {
		const arch = await archive('../assets/simple.docx');
		contentTypes = await ContentTypesXml.fromArchive(
			arch,
			'[Content_Types].xml'
		);
		footnotes = await FootnotesXml.fromArchive(
			arch,
			contentTypes,
			'word/footnotes.xml'
		);
	});

	it('Newly created footnotes are empty', () => {
		expect(footnotes.isEmpty()).toBe(true);
	});

	it('serializes correctly if there are no footnotes (the two default ones must be there)', async () => {
		expect(serialize(await footnotes.$$$toNode())).toBe(
			`<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:footnote w:id="-1" w:type="separator">
					<w:p>
						<w:r>
							<w:separator/>
						</w:r>
					</w:p>
				</w:footnote>
				<w:footnote w:id="0" w:type="continuationSeparator">
					<w:p>
						<w:r>
							<w:continuationSeparator/>
						</w:r>
					</w:p>
				</w:footnote>
			</w:footnotes>`.replace(/\n|\t/g, '')
		);
	});

	it('can add a footnote with minimum information', async () => {
		footnotes.$$$clearFootnotes();
		const footnoteId = await footnotes.add([], 'MyStyle');
		const expectedFootnote = `<w:footnote w:id="${footnoteId}"><w:p><w:r><w:rPr><w:rStyle w:val="MyStyle"/></w:rPr><w:footnoteRef/></w:r></w:p></w:footnote>`;

		expect(serialize(await footnotes.$$$toNode())).toBe(
			`<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:footnote w:id="-1" w:type="separator">
					<w:p>
						<w:r>
							<w:separator/>
						</w:r>
					</w:p>
				</w:footnote>
				<w:footnote w:id="0" w:type="continuationSeparator">
					<w:p>
						<w:r>
							<w:continuationSeparator/>
						</w:r>
					</w:p>
				</w:footnote>
				${expectedFootnote}
			</w:footnotes>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a footnote with paragraphs', async () => {
		footnotes.$$$clearFootnotes();
		const footnoteId = await footnotes.add(
			[new Paragraph({}, new Text({}, 'Hello, this is a footnote.'))],
			'MyStyle'
		);
		const expectedFootnote = `
			<w:footnote w:id="${footnoteId}">
				<w:p>
					<w:r>
						<w:rPr>
							<w:rStyle w:val="MyStyle"/>
						</w:rPr>
						<w:footnoteRef/>
					</w:r>
					<w:r>
						<w:t xml:space="preserve"> Hello, this is a footnote.</w:t>
					</w:r>
				</w:p>
			</w:footnote>`;

		expect(serialize(await footnotes.$$$toNode())).toBe(
			`<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:footnote w:id="-1" w:type="separator">
					<w:p>
						<w:r>
							<w:separator/>
						</w:r>
					</w:p>
				</w:footnote>
				<w:footnote w:id="0" w:type="continuationSeparator">
					<w:p>
						<w:r>
							<w:continuationSeparator/>
						</w:r>
					</w:p>
				</w:footnote>
				${expectedFootnote}
			</w:footnotes>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a footnote with multiple paragraphs', async () => {
		footnotes.$$$clearFootnotes();

		const footnoteId = await footnotes.add(
			[
				new Paragraph({}, new Text({}, 'Hello, this is a footnote 1.')),
				new Paragraph({}, new Text({}, 'Hello, this is a footnote 2.')),
			],
			'MyStyle'
		);
		const expectedFootnote = `
			<w:footnote w:id="${footnoteId}">
				<w:p>
					<w:r>
						<w:rPr>
							<w:rStyle w:val="MyStyle"/>
						</w:rPr>
						<w:footnoteRef/>
					</w:r>
					<w:r>
						<w:t xml:space="preserve"> Hello, this is a footnote 1.</w:t>
					</w:r>
				</w:p>
				<w:p>
					<w:r>
						<w:t xml:space="preserve">Hello, this is a footnote 2.</w:t>
					</w:r>
				</w:p>
			</w:footnote>`;

		expect(serialize(await footnotes.$$$toNode())).toBe(
			`<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:footnote w:id="-1" w:type="separator">
					<w:p>
						<w:r>
							<w:separator/>
						</w:r>
					</w:p>
				</w:footnote>
				<w:footnote w:id="0" w:type="continuationSeparator">
					<w:p>
						<w:r>
							<w:continuationSeparator/>
						</w:r>
					</w:p>
				</w:footnote>
				${expectedFootnote}
			</w:footnotes>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a footnote with tables', async () => {
		footnotes.$$$clearFootnotes();

		const footnoteId = await footnotes.add(
			[
				new Table(
					{
						columnWidths: [cm(3)],
						cellPadding: {
							top: pt(6),
							bottom: pt(6),
							start: pt(6),
							end: pt(6),
						},
						borders: {
							bottom: {
								color: '666666',
								width: pt(1),
								type: 'single',
							},
							start: {
								color: '666666',
								width: pt(1),
								type: 'single',
							},
							top: {
								color: '666666',
								width: pt(1),
								type: 'single',
							},
							end: {
								color: '666666',
								width: pt(1),
								type: 'single',
							},
							insideH: {
								color: 'CCCCCC',
								width: pt(1),
								type: 'dashed',
							},
							insideV: {
								color: 'CCCCCC',
								width: pt(1),
								type: 'dashed',
							},
						},
					},
					new Row(
						{},
						new Cell(
							{},
							new Paragraph(
								{},
								new Text(
									{ style: 'Text' },
									'This is a table cell'
								)
							)
						)
					)
				),
			],
			'MyStyle'
		);
		const expectedFootnote = `
			<w:footnote w:id="${footnoteId}">
				<w:p>
					<w:r>
						<w:rPr>
							<w:rStyle w:val="MyStyle"/>
						</w:rPr>
						<w:footnoteRef/>
					</w:r>
				</w:p>
				<w:tbl><w:tblPr><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:start w:w="120" w:type="dxa"/><w:end w:w="120" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="8" w:color="666666"/><w:start w:val="single" w:sz="8" w:color="666666"/><w:bottom w:val="single" w:sz="8" w:color="666666"/><w:end w:val="single" w:sz="8" w:color="666666"/><w:insideH w:val="dashed" w:sz="8" w:color="CCCCCC"/><w:insideV w:val="dashed" w:sz="8" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="1701"/></w:tblGrid><w:tr><w:tc><w:tcPr><w:tcW w:w="1701" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:rStyle w:val="Text"/></w:rPr><w:t xml:space="preserve">This is a table cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
			</w:footnote>`;

		expect(serialize(await footnotes.$$$toNode())).toBe(
			`<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:footnote w:id="-1" w:type="separator">
					<w:p>
						<w:r>
							<w:separator/>
						</w:r>
					</w:p>
				</w:footnote>
				<w:footnote w:id="0" w:type="continuationSeparator">
					<w:p>
						<w:r>
							<w:continuationSeparator/>
						</w:r>
					</w:p>
				</w:footnote>
				${expectedFootnote}
			</w:footnotes>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('Images are added with correct relationships', async () => {
		const image = new Image({
			data: Deno.readFile('assets/spacekees.jpeg'),
			width: cm(2.54),
			height: cm(2.54),
			title: 'Title',
			alt: 'Alt',
		});
		await footnotes.add(new Paragraph({}, new Text({}, image)), 'MyStyle');

		// A _rels file is created for our footnotes.
		expect(footnotes.relationships.location).toBe(
			'word/_rels/footnotes.xml.rels'
		);

		// That _rels file contains a reference to our image.
		// This should be our only RelationshipsXml file at this point, so we can use meta[0].
		expect(footnotes.relationships.meta[0].id).toBe(
			image.meta.relationshipId
		);

		expect(footnotes.relationships.meta[0].target).toBe(
			image.meta.location
		);
	});
});
