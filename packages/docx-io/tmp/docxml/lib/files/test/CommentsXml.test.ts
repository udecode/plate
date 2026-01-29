import { expect } from 'std/expect';
import { beforeEach, describe, it } from 'std/testing/bdd';

import { Paragraph } from '../../components/document/src/Paragraph.ts';
import { Text } from '../../components/document/src/Text.ts';
import { parse, serialize } from '../../utilities/src/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { archive } from '../../utilities/src/tests.ts';
import { CommentsXml } from '../src/CommentsXml.ts';
import { ContentTypesXml } from '../src/ContentTypesXml.ts';

describe('Comments', () => {
	let contentTypes: ContentTypesXml;
	let comments: CommentsXml;
	beforeEach(async () => {
		const arch = await archive('../assets/simple.docx');
		contentTypes = await ContentTypesXml.fromArchive(
			arch,
			'[Content_Types].xml'
		);
		// The comments file is not included in the archive by default. Add an empty one.
		arch.addXmlFile(
			'word/comments.xml',
			parse(`<w:comments ${ALL_NAMESPACE_DECLARATIONS} />`)
		);
		comments = await CommentsXml.fromArchive(
			arch,
			contentTypes,
			'word/comments.xml'
		);
		comments.$$$initializeCommentsExtended();
	});

	it('serializes correctly if there are no comments', async () => {
		expect(serialize(await comments.$$$toNode())).toBe(
			`<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`.replace(
				/\n|\t/g,
				''
			)
		);
	});

	it('can add a comment with minimum information', async () => {
		const date = new Date();

		const commentId = comments.add({ author: 'foo', date }, []);
		const expectedComment = `<w:comment w:id="${
			commentId.int
		}" w:author="foo" w:date="${date.toISOString()}"/>`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment with and without initials', async () => {
		const date = new Date();

		const commentId = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB' },
			[]
		);
		const expectedComment = `<w:comment w:id="${
			commentId.int
		}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}"/>`;

		const commentId2 = comments.add(
			{ author: 'Foo Bar', date, initials: null },
			[]
		);
		const expectedComment2 = `<w:comment w:id="${
			commentId2.int
		}" w:author="Foo Bar" w:date="${date.toISOString()}"/>`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
					${expectedComment2}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment with contents', async () => {
		const date = new Date();

		const para = new Paragraph({}, new Text({}, 'Hello world.'));
		const commentId = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB' },
			[para]
		);
		const expectedComment = `
			<w:comment w:id="${
				commentId.int
			}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}">
				<w:p xmlns:ns1="http://schemas.microsoft.com/office/word/2010/wordml" ns1:paraId="00000001">
					<w:r>
						<w:t xml:space="preserve">Hello world.</w:t>
					</w:r>
				</w:p>
			</w:comment>
		`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedComment}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment with parent identifier', async () => {
		const date = new Date();

		const parent = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB' },
			[new Paragraph({}, new Text({}, 'Hello'))]
		);
		const child = comments.add(
			{ author: 'Foo Bar', date, initials: 'FB', parentId: parent },
			[new Paragraph({}, new Text({}, 'world!'))]
		);

		const expectedParentComment = `
			<w:comment w:id="${
				parent.int
			}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}">
				<w:p xmlns:ns1="http://schemas.microsoft.com/office/word/2010/wordml" ns1:paraId="00000001">
					<w:r>
						<w:t xml:space="preserve">Hello</w:t>
					</w:r>
				</w:p>
			</w:comment>
		`;
		const expectedParentCommentExtended = `<w15:commentEx w15:paraId="0000000${parent.int}"/>`;

		const expectedChildComment = `
			<w:comment w:id="${
				child.int
			}" w:author="Foo Bar" w:initials="FB" w:date="${date.toISOString()}">
				<w:p xmlns:ns2="http://schemas.microsoft.com/office/word/2010/wordml" ns2:paraId="00000002">
					<w:r>
						<w:t xml:space="preserve">world!</w:t>
					</w:r>
				</w:p>
			</w:comment>
		`;
		const expectedChildCommentExtended = `<w15:commentEx w15:paraId="0000000${child.int}" w15:paraIdParent="0000000${parent.int}"/>`;

		expect(serialize(await comments.$$$toNode())).toBe(
			`
				<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
					${expectedParentComment}
					${expectedChildComment}
				</w:comments>	
			`.replace(/\n|\t/g, '')
		);

		expect(serialize(comments.$$$commentsExtended.$$$toNode())).toBe(
			`
				<w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
					${expectedParentCommentExtended}
					${expectedChildCommentExtended}
				</w15:commentsEx>	
			`.replace(/\n|\t/g, '')
		);
	});
});
