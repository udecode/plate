import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { CommentRangeEnd } from '../../comments/src/CommentRangeEnd.ts';
import { CommentRangeStart } from '../../comments/src/CommentRangeStart.ts';
import { BookmarkRangeEnd } from '../../document/src/BookmarkRangeEnd.ts';
import { BookmarkRangeStart } from '../../document/src/BookmarkRangeStart.ts';
import { Paragraph } from '../../document/src/Paragraph.ts';
import { Text } from '../../document/src/Text.ts';
import { DeletedText } from '../src/DeletedText.ts';
import { MoveFromRangeEnd } from '../../track-changes/src/MoveFromRangeEnd.ts';
import { MoveFromRangeStart } from '../../track-changes/src/MoveFromRangeStart.ts';
import { MoveToRangeEnd } from '../../track-changes/src/MoveToRangeEnd.ts';
import { MoveToRangeStart } from '../../track-changes/src/MoveToRangeStart.ts';
import { Deletion } from '../src/Deletion.ts';
import { MoveFrom } from '../src/MoveFrom.ts';
import { MoveTo } from '../src/MoveTo.ts';

describe('Deletion', () => {
	const date = new Date();

	const emptyContext: ComponentContext = {
		archive: new Archive(),
		relationships: null,
	};

	describe('Deleted run content', () => {
		describe('Text', () => {
			const deletedTextNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:r><w:delText>This is a new paragraph</w:delText></w:r>
					</w:del>
					<w:del w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:r><w:delText>This is a another new paragraph</w:delText></w:r>
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedText1 = new Deletion(
				{ author: 'Luis', date: date, id: 1 },
				new DeletedText({}, 'This is a new paragraph')
			);
			const deletedText2 = new Deletion(
				{ author: 'Roy', date: date, id: 2 },
				new DeletedText({}, 'This is a another new paragraph')
			);
			const deletedTextAsObject = new Paragraph(
				{},
				deletedText1,
				deletedText2
			);

			const deletedTextAsNode = Paragraph.fromNode(
				deletedTextNode,
				emptyContext
			);

			it('Text node has expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedTextAsNode.children).toHaveLength(2);
				expect(deletedTextAsNode.children[0]).toEqual(deletedText1);
				expect(deletedTextAsNode.children[1]).toEqual(deletedText2);
			});

			it('serializes and deserialized correctly', async () => {
				expect(serialize(await deletedTextAsObject.toNode([]))).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<r>
										<delText xml:space="preserve">This is a new paragraph</delText>
									</r>
								</del>
								<del xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<r>
										<delText xml:space="preserve">This is a another new paragraph</delText>
									</r>
								</del>
								
							</p>`
						)
					)
				);
			});
		});

		describe('Text without date and author', () => {
			const deletedTextNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1">
						<w:r><w:delText>This is a new paragraph</w:delText></w:r>
					</w:del>
					<w:del w:id="2">
						<w:r><w:delText>This is a another new paragraph</w:delText></w:r>
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedText1 = new Deletion(
				{ id: 1 },
				new DeletedText({}, 'This is a new paragraph')
			);
			const deletedText2 = new Deletion(
				{ id: 2 },
				new DeletedText({}, 'This is a another new paragraph')
			);
			const deletedTextAsObject = new Paragraph(
				{},
				deletedText1,
				deletedText2
			);

			const deletedTextAsNode = Paragraph.fromNode(
				deletedTextNode,
				emptyContext
			);

			it('Text node has expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedTextAsNode.children).toHaveLength(2);
				expect(deletedTextAsNode.children[0]).toEqual(deletedText1);
				expect(deletedTextAsNode.children[1]).toEqual(deletedText2);
			});

			it('serializes and deserialized correctly', async () => {
				expect(serialize(await deletedTextAsObject.toNode([]))).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${NamespaceUri.w}" ns1:id="1">
									<r>
										<delText xml:space="preserve">This is a new paragraph</delText>
									</r>
								</del>
								<del xmlns:ns2="${NamespaceUri.w}" ns2:id="2">
									<r>
										<delText xml:space="preserve">This is a another new paragraph</delText>
									</r>
								</del>
							</p>`
						)
					)
				);
			});
		});

		describe('BookmarkRangeStart and BookmarkRangeEnd ', () => {
			const deletedBookmarkRangeNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:bookmarkStart w:id="0" w:name="Test1"/>
						<w:bookmarkEnd w:id="0"/>
					</w:del>
					<w:del w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:bookmarkStart w:id="1" w:name="Test2"/>
						<w:bookmarkEnd w:id="1"/>
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedBookmarkRange1 = new Deletion(
				{ author: 'Luis', date: date, id: 1 },
				new BookmarkRangeStart({ id: 0, name: 'Test1' }),
				new BookmarkRangeEnd({ id: 0 })
			);
			const deletedBookmarkRange2 = new Deletion(
				{ author: 'Roy', date: date, id: 2 },
				new BookmarkRangeStart({ id: 1, name: 'Test2' }),
				new BookmarkRangeEnd({ id: 1 })
			);
			const deletedBookmarkRangeAsObject = new Paragraph(
				{},
				deletedBookmarkRange1,
				deletedBookmarkRange2
			);

			const deletedBookmarkRangeAsNode = Paragraph.fromNode(
				deletedBookmarkRangeNode,
				emptyContext
			);

			it('BookmarkRangeStart node has expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedBookmarkRangeAsNode.children).toHaveLength(2);
				expect(deletedBookmarkRangeAsNode.children[0]).toEqual(
					deletedBookmarkRange1
				);
				expect(deletedBookmarkRangeAsNode.children[1]).toEqual(
					deletedBookmarkRange2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await deletedBookmarkRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<ns1:bookmarkStart ns1:id="0" ns1:name="Test1"/>
									<ns1:bookmarkEnd ns1:id="0"/>
								</del>
								<del xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<ns2:bookmarkStart ns2:id="1" ns2:name="Test2"/>
									<ns2:bookmarkEnd ns2:id="1"/>
								</del>
								
							</p>`
						)
					)
				);
			});
		});

		describe('CommentRangeStart and CommentRangeEnd', () => {
			const deletedCommentRangeNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:commentRangeStart w:id="0"/>
						<w:commentRangeEnd w:id="0"/>
					</w:del>
					<w:del w:id="2" w:author="Roy" w:date="${date.toISOString()}">
						<w:commentRangeStart w:id="1"/>
						<w:commentRangeEnd w:id="1"/>
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedCommentRange1 = new Deletion(
				{ author: 'Luis', date: date, id: 1 },
				new CommentRangeStart({ id: { hex: '00000000', int: 0 } }),
				new CommentRangeEnd({ id: { hex: '00000000', int: 0 } })
			);
			const deletedCommentRange2 = new Deletion(
				{ author: 'Roy', date: date, id: 2 },
				new CommentRangeStart({ id: { hex: '00000001', int: 1 } }),
				new CommentRangeEnd({ id: { hex: '00000001', int: 1 } })
			);
			const deletedCommentRangeAsObject = new Paragraph(
				{},
				deletedCommentRange1,
				deletedCommentRange2
			);

			const deletedCommentRangeEndAsNode = Paragraph.fromNode(
				deletedCommentRangeNode,
				emptyContext
			);

			it('CommentRange nodes have expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedCommentRangeEndAsNode.children).toHaveLength(2);
				expect(deletedCommentRangeEndAsNode.children[0]).toEqual(
					deletedCommentRange1
				);
				expect(deletedCommentRangeEndAsNode.children[1]).toEqual(
					deletedCommentRange2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await deletedCommentRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}">
									<ns1:commentRangeStart ns1:id="0"/>
									<ns1:commentRangeEnd ns1:id="0"/>
								</del>
								<del xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Roy" ns2:date="${date.toISOString()}">
									<ns2:commentRangeStart ns2:id="1"/>
									<ns2:commentRangeEnd ns2:id="1"/>
								</del>
								
							</p>`
						)
					)
				);
			});
		});

		describe('MoveTo and MoveFrom', () => {
			const deletedMoveToNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
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
					</w:del>
					<w:del w:id="2" w:author="Roy" w:date="${date.toISOString()}">
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
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedMove1 = new Deletion(
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
			const deletedMove2 = new Deletion(
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
			const deletedCommentRangeAsObject = new Paragraph(
				{},
				deletedMove1,
				deletedMove2
			);

			const deletedCommentRangeEndAsNode = Paragraph.fromNode(
				deletedMoveToNode,
				emptyContext
			);

			it('Move nodes have expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedCommentRangeEndAsNode.children).toHaveLength(2);
				expect(deletedCommentRangeEndAsNode.children[0]).toEqual(
					deletedMove1
				);
				expect(deletedCommentRangeEndAsNode.children[1]).toEqual(
					deletedMove2
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await deletedCommentRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${
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
								</del>
								<del xmlns:ns2="${
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
								</del>
								
							</p>`
						)
					)
				);
			});
		});

		describe('MoveToRangeStart, MoveToRangeEnd, MoveFromRangeStart, MoveFromRangeEnd', () => {
			const deletedMoveRangeToNode = create(
				`<w:p xmlns:w="${NamespaceUri.w}">
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:moveToRangeStart xmlns:w="${
							NamespaceUri.w
						}" w:id="0" w:date="${date.toISOString()}" w:author="Gabe" w:name="Move_to_1" />
						<w:moveToRangeEnd xmlns:w="${NamespaceUri.w}" w:id="0" />
						<w:moveFromRangeStart xmlns:w="${
							NamespaceUri.w
						}" w:id="1" w:date="${date.toISOString()}" w:author="Angel" w:name="Move_from_1" />
						<w:moveFromRangeEnd xmlns:w="${NamespaceUri.w}" w:id="1" />
					</w:del>
				</w:p>
				`,
				emptyContext
			);

			const deletedMoveRange = new Deletion(
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

			const deletedMoveRangeAsObject = new Paragraph(
				{},
				deletedMoveRange
			);

			const deletedMoveRangeEndAsNode = Paragraph.fromNode(
				deletedMoveRangeToNode,
				emptyContext
			);

			it('Move range nodes have expected deletion objects', () => {
				// It should present the two deletions
				expect(deletedMoveRangeEndAsNode.children).toHaveLength(1);
				expect(deletedMoveRangeEndAsNode.children[0]).toEqual(
					deletedMoveRange
				);
			});

			it('serializes and deserialized correctly', async () => {
				expect(
					serialize(await deletedMoveRangeAsObject.toNode([]))
				).toEqual(
					serialize(
						create(
							`<p xmlns="${NamespaceUri.w}">
								<del xmlns:ns1="${
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
								</del>	
							</p>`
						)
					)
				);
			});
		});
	});

	describe('Deleted paragraph', () => {
		const deletedParagraphNode = create(
			`<w:p xmlns:w="${NamespaceUri.w}">
				<w:pPr>
					<w:rPr>
						<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}" />
					</w:rPr>
				</w:pPr>
				<w:r>
					<w:del w:id="1" w:author="Luis" w:date="${date.toISOString()}">
						<w:delText>This is a deleted paragraph</w:delText>
					</w:del>
				</w:r>
			</w:p>
			`,
			emptyContext
		);

		const deletedParagraphAsProp = new Paragraph(
			{ pilcrow: { deletion: { author: 'Luis', date: date, id: 1 } } },
			new Deletion(
				{ author: 'Luis', date: date, id: 1 },
				new DeletedText({}, 'This is a deleted paragraph')
			)
		);

		const deletedParagraphAsNode = Paragraph.fromNode(
			deletedParagraphNode,
			emptyContext
		);

		it('Paragraph node has expected deletion objects', () => {
			expect(deletedParagraphAsNode.props.pilcrow?.deletion).toEqual(
				deletedParagraphAsProp.props.pilcrow?.deletion
			);
		});

		it('serializes and deserialized correctly', async () => {
			expect(serialize(await deletedParagraphAsProp.toNode([]))).toEqual(
				serialize(
					create(
						`<p xmlns="${NamespaceUri.w}">
							<pPr>
								<rPr>
									<del xmlns:ns1="${
										NamespaceUri.w
									}" ns1:id="1" ns1:author="Luis" ns1:date="${date.toISOString()}" />
								</rPr>
							</pPr>
							<del xmlns:ns2="${
								NamespaceUri.w
							}" ns2:id="1" ns2:author="Luis" ns2:date="${date.toISOString()}">
								<r>
									<delText xml:space="preserve">This is a deleted paragraph</delText>
								</r>
							</del>
						</p>`
					)
				)
			);
		});
	});
});
