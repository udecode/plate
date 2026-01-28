import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import {
	BookmarkRangeEnd,
	BookmarkRangeStart,
	CommentRangeEnd,
	CommentRangeStart,
	Insertion,
	MoveFrom,
	MoveTo,
	Paragraph,
	Text,
} from '../../../../mod.ts';
import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { MoveFromRangeEnd } from '../src/MoveFromRangeEnd.ts';
import { MoveFromRangeStart } from '../src/MoveFromRangeStart.ts';
import { MoveToRangeEnd } from '../src/MoveToRangeEnd.ts';
import { MoveToRangeStart } from '../src/MoveToRangeStart.ts';

describe('Insertion', () => {
	const date = new Date();

	const emptyContext: ComponentContext = {
		archive: new Archive(),
		relationships: null,
	};

	describe('Inserted run content', () => {
		describe('Text', () => {
			const insertedTextNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:r><w:t>This is a new paragraph</w:t></w:r>
					</w:ins>
					<w:ins w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:r><w:t>This is a another new paragraph</w:t></w:r>
					</w:ins>
				</w:p>
				`,
				emptyContext
			);

			const insertedText1 = new Insertion(
				{ author: 'Luis', date: date, id: 1 },
				new Text({}, 'This is a new paragraph')
			);
			const insertedText2 = new Insertion(
				{ author: 'Roy', date: date, id: 2 },
				new Text({}, 'This is a another new paragraph')
			);
			const insertedTextAsObject = new Paragraph(
				{},
				insertedText1,
				insertedText2
			);

			const insertedTextAsNode = Paragraph.fromNode(
				insertedTextNode,
				emptyContext
			);

			it('Text node has expected insertion objects', () => {
				// It should present the two insertions
				expect(insertedTextAsNode.children).toHaveLength(2);
				expect(insertedTextAsNode.children[0]).toEqual(insertedText1);
				expect(insertedTextAsNode.children[1]).toEqual(insertedText2);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await insertedTextAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<ins xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
										<r>
											<t xml:space="preserve">This is a new paragraph</t>
										</r>
								</ins>
								<ins xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
										<r>
											<t xml:space="preserve">This is a another new paragraph</t>
										</r>
								</ins>
								
							</p>`
						)
					)
				);
			});
		});

		describe('BookmarkRangeStart and BookmarkRangeEnd ', () => {
			const insertedBookmarkRangeNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:bookmarkStart w:id="0" w:name="Test1"/>
						<w:bookmarkEnd w:id="0"/>
					</w:ins>
					<w:ins w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:bookmarkStart w:id="1" w:name="Test2"/>
						<w:bookmarkEnd w:id="1"/>
					</w:ins>
				</w:p>
				`,
				emptyContext
			);

			const insertedBookmarkRange1 = new Insertion(
				{ author: 'Luis', date: date, id: 1 },
				new BookmarkRangeStart({ id: 0, name: 'Test1' }),
				new BookmarkRangeEnd({ id: 0 })
			);
			const insertedBookmarkRange2 = new Insertion(
				{ author: 'Roy', date: date, id: 2 },
				new BookmarkRangeStart({ id: 1, name: 'Test2' }),
				new BookmarkRangeEnd({ id: 1 })
			);
			const insertedBookmarkRangeAsObject = new Paragraph(
				{},
				insertedBookmarkRange1,
				insertedBookmarkRange2
			);

			const insertedBookmarkRangeAsNode = Paragraph.fromNode(
				insertedBookmarkRangeNode,
				emptyContext
			);

			it('BookmarkRangeStart node has expected insertion objects', () => {
				// It should present the two insertions
				expect(insertedBookmarkRangeAsNode.children).toHaveLength(2);
				expect(insertedBookmarkRangeAsNode.children[0]).toEqual(
					insertedBookmarkRange1
				);
				expect(insertedBookmarkRangeAsNode.children[1]).toEqual(
					insertedBookmarkRange2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await insertedBookmarkRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<ins xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<ns1:bookmarkStart ns1:id="0" ns1:name="Test1"/>
									<ns1:bookmarkEnd ns1:id="0"/>
								</ins>
								<ins xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<ns2:bookmarkStart ns2:id="1" ns2:name="Test2"/>
									<ns2:bookmarkEnd ns2:id="1"/>
								</ins>
								
							</p>`
						)
					)
				);
			});
		});

		describe('CommentRangeStart and CommentRangeEnd', () => {
			const insertedCommentRangeNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:commentRangeStart w:id="0"/>
						<w:commentRangeEnd w:id="0"/>
					</w:ins>
					<w:ins w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:commentRangeStart w:id="1"/>
						<w:commentRangeEnd w:id="1"/>
					</w:ins>
				</w:p>
				`,
				emptyContext
			);

			const insertedCommentRange1 = new Insertion(
				{ author: 'Luis', date: date, id: 1 },
				new CommentRangeStart({ id: { hex: '00000000', int: 0 } }),
				new CommentRangeEnd({ id: { hex: '00000000', int: 0 } })
			);
			const insertedCommentRange2 = new Insertion(
				{ author: 'Roy', date: date, id: 2 },
				new CommentRangeStart({ id: { hex: '00000001', int: 1 } }),
				new CommentRangeEnd({ id: { hex: '00000001', int: 1 } })
			);
			const insertedCommentRangeAsObject = new Paragraph(
				{},
				insertedCommentRange1,
				insertedCommentRange2
			);

			const insertedCommentRangeEndAsNode = Paragraph.fromNode(
				insertedCommentRangeNode,
				emptyContext
			);

			it('CommentRange nodes have expected insertion objects', () => {
				// It should present the two insertions
				expect(insertedCommentRangeEndAsNode.children).toHaveLength(2);
				expect(insertedCommentRangeEndAsNode.children[0]).toEqual(
					insertedCommentRange1
				);
				expect(insertedCommentRangeEndAsNode.children[1]).toEqual(
					insertedCommentRange2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await insertedCommentRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<ins xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<ns1:commentRangeStart ns1:id="0"/>
									<ns1:commentRangeEnd ns1:id="0"/>
								</ins>
								<ins xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<ns2:commentRangeStart ns2:id="1"/>
									<ns2:commentRangeEnd ns2:id="1"/>
								</ins>
								
							</p>`
						)
					)
				);
			});
		});

		describe('MoveTo and MoveFrom', () => {
			const insertedMoveToNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:moveTo w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
							<w:r>
								<w:t xml:space="preserve">Moved content</w:t>
							</w:r>
						</w:moveTo>
						<w:moveFrom w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
							<w:r>
								<w:t xml:space="preserve">Moved content</w:t>
							</w:r>
						</w:moveFrom>
					</w:ins>
					<w:ins w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:moveTo w:id="1" w:author="Gabe" w:date="${date.toISOString()}">
							<w:r>
								<w:t xml:space="preserve">More moved content</w:t>
							</w:r>
						</w:moveTo>
						<w:moveFrom w:id="1" w:author="Gabe" w:date="${date.toISOString()}">
							<w:r>
								<w:t xml:space="preserve">More moved content</w:t>
							</w:r>
						</w:moveFrom>
					</w:ins>
				</w:p>
				`,
				emptyContext
			);

			const insertedMove1 = new Insertion(
				{ author: 'Luis', date: date, id: 1 },
				new MoveTo(
					{
						id: 0,
						date: date,
						author: 'Gabe',
					},
					new Text({}, 'Moved content')
				),
				new MoveFrom(
					{
						id: 0,
						date: date,
						author: 'Gabe',
					},
					new Text({}, 'Moved content')
				)
			);
			const insertedMove2 = new Insertion(
				{ author: 'Roy', date: date, id: 2 },
				new MoveTo(
					{
						id: 1,
						date: date,
						author: 'Gabe',
					},
					new Text({}, 'More moved content')
				),
				new MoveFrom(
					{
						id: 1,
						date: date,
						author: 'Gabe',
					},
					new Text({}, 'More moved content')
				)
			);
			const insertedCommentRangeAsObject = new Paragraph(
				{},
				insertedMove1,
				insertedMove2
			);

			const insertedCommentRangeEndAsNode = Paragraph.fromNode(
				insertedMoveToNode,
				emptyContext
			);

			it('Move nodes have expected insertion objects', () => {
				// It should present the two insertions
				expect(insertedCommentRangeEndAsNode.children).toHaveLength(2);
				expect(insertedCommentRangeEndAsNode.children[0]).toEqual(
					insertedMove1
				);
				expect(insertedCommentRangeEndAsNode.children[1]).toEqual(
					insertedMove2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await insertedCommentRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<ins xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<moveTo xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="0" ns1:date="${date.toISOString()}" ns1:author="Gabe">
										<r>
											<t xml:space="preserve">Moved content</t>
										</r>
									</moveTo>
									<moveFrom xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="0" ns1:date="${date.toISOString()}" ns1:author="Gabe">
										<r>
											<t xml:space="preserve">Moved content</t>
										</r>
									</moveFrom>
								</ins>
								<ins xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<moveTo xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="1" ns1:date="${date.toISOString()}" ns1:author="Gabe">
										<r>
											<t xml:space="preserve">More moved content</t>
										</r>
									</moveTo>
									<moveFrom xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="1" ns1:date="${date.toISOString()}" ns1:author="Gabe">
										<r>
											<t xml:space="preserve">More moved content</t>
										</r>
									</moveFrom>
								</ins>
								
							</p>`
						)
					)
				);
			});
		});

		describe('MoveRangeStart and MoveRangeEnd', () => {
			const insertedMoveRangeToNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:moveToRangeStart xmlns:w="${
							NamespaceUri.w
						}" w:id="0" w:date="${date.toISOString()}" w:author="Gabe" w:name="Move_to_1" />
						<w:moveToRangeEnd xmlns:w="${NamespaceUri.w}" w:id="0" />
						<w:moveFromRangeStart xmlns:w="${
							NamespaceUri.w
						}" w:id="1" w:date="${date.toISOString()}" w:author="Angel" w:name="Move_from_1" />
						<w:moveFromRangeEnd xmlns:w="${NamespaceUri.w}" w:id="1" />
					</w:ins>
				</w:p>
				`,
				emptyContext
			);

			const insertedMoveRange = new Insertion(
				{ author: 'Luis', date: date, id: 1 },
				new MoveToRangeStart({
					id: 0,
					date: date,
					author: 'Gabe',
					name: 'Move_to_1',
				}),
				new MoveToRangeEnd({
					id: 0,
				}),
				new MoveFromRangeStart({
					id: 1,
					date: date,
					author: 'Angel',
					name: 'Move_from_1',
				}),
				new MoveFromRangeEnd({
					id: 1,
				})
			);

			const insertedMoveRangeAsObject = new Paragraph(
				{},
				insertedMoveRange
			);

			const insertedMoveRangeEndAsNode = Paragraph.fromNode(
				insertedMoveRangeToNode,
				emptyContext
			);

			it('Move range nodes have expected insertion objects', () => {
				// It should present the two insertions
				expect(insertedMoveRangeEndAsNode.children).toHaveLength(1);
				expect(insertedMoveRangeEndAsNode.children[0]).toEqual(
					insertedMoveRange
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await insertedMoveRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<ins xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<moveToRangeStart xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" 
									ns1:id="0" ns1:date="${date.toISOString()}" ns1:author="Gabe" ns1:name="Move_to_1" />
									<moveToRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns2="${
								NamespaceUri.w
							}" ns2:id="0" />
									<moveFromRangeStart xmlns="${NamespaceUri.w}" xmlns:ns3="${NamespaceUri.w}" 
									ns3:id="1" ns3:date="${date.toISOString()}" ns3:author="Angel" ns3:name="Move_from_1" />
									<moveFromRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns4="${
								NamespaceUri.w
							}" ns4:id="1" />
								</ins>	
							</p>`
						)
					)
				);
			});
		});
	});

	describe('Inserted paragraph', () => {
		// Here we test the insertion of a paragraph with a pilcrow
		const insertedParagraphNode = create(
			`<w:p xmlns:w="${NamespaceUri.w}">
				<w:pPr>
					<w:rPr>
						<w:ins w:id="1" w:author="Luis" w:date="${date.toISOString()}" />
					</w:rPr>
				</w:pPr>
				<w:r>
					<w:t>This is a new paragraph</w:t>
				</w:r>
			</w:p>
			`,
			emptyContext
		);

		const insertedParagraphAsProp = new Paragraph(
			{ pilcrow: { insertion: { author: 'Luis', date: date, id: 1 } } },
			new Text({}, 'This is a new paragraph')
		);

		const insertedParagraphAsNode = Paragraph.fromNode(
			insertedParagraphNode,
			emptyContext
		);

		it('Paragraph node has expected insertion objects', () => {
			expect(insertedParagraphAsNode.props.pilcrow?.insertion).toEqual(
				insertedParagraphAsProp.props.pilcrow?.insertion
			);
		});

		it('serializes and deserialized correctly', async () => {
			expect(serialize(await insertedParagraphAsProp.toNode([]))).toEqual(
				serialize(
					create(
						`<p xmlns="${NamespaceUri.w}">
							<pPr>
								<rPr>
									<ins xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}" />
								</rPr>
							</pPr>
							<r>
								<t xml:space="preserve">This is a new paragraph</t>
							</r>				
						</p>`
					)
				)
			);
		});
	});
});
