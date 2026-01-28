import { expect } from 'std/expect';
import { beforeEach, describe, it } from 'std/testing/bdd';

import { parse, serialize } from '../../utilities/src/dom.ts';
import { int } from '../../utilities/src/id.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { archive } from '../../utilities/src/tests.ts';
import { CommentsExtendedXml } from '../src/CommentsExtendedXml.ts';
import { ContentTypesXml } from '../src/ContentTypesXml.ts';

describe('CommentsExtended', () => {
	let contentTypes: ContentTypesXml;
	let commentsExtended: CommentsExtendedXml;
	beforeEach(async () => {
		const arch = await archive('../assets/simple.docx');
		contentTypes = await ContentTypesXml.fromArchive(
			arch,
			'[Content_Types].xml'
		);
		// The comments file is not included in the archive by default. Add an empty one.
		arch.addXmlFile(
			'word/commentsExtended.xml',
			parse(`<w15:commentsEx ${ALL_NAMESPACE_DECLARATIONS} />`)
		);
		commentsExtended = await CommentsExtendedXml.fromArchive(
			arch,
			contentTypes,
			'word/commentsExtended.xml'
		);
	});

	it('serializes correctly if there are no comments', () => {
		expect(serialize(commentsExtended.$$$toNode())).toBe(
			`<w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"/>`.replace(
				/\n|\t/g,
				''
			)
		);
	});

	it('can add a comment extension with minimum information', () => {
		commentsExtended.add({ id: int(1) });
		const expectedComment = `<w15:commentEx w15:paraId="00000001"/>`;

		expect(serialize(commentsExtended.$$$toNode())).toBe(
			`
				<w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
					${expectedComment}
				</w15:commentsEx>	
			`.replace(/\n|\t/g, '')
		);
	});

	it('can add a comment extension with maximum information', () => {
		commentsExtended.add({ id: int(4294967295), parentId: int(19687) });
		const expectedComment = `<w15:commentEx w15:paraId="FFFFFFFF" w15:paraIdParent="00004CE7"/>`;

		expect(serialize(commentsExtended.$$$toNode())).toBe(
			`
				<w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
					${expectedComment}
				</w15:commentsEx>	
			`.replace(/\n|\t/g, '')
		);
	});
});
