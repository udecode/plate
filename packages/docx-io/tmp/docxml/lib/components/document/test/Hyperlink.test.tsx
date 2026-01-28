/** @jsx Docx.jsx */
import { expect } from 'std/expect';
import { it } from 'std/testing/bdd';

import { Docx } from '../../../Docx.ts';
import { Hyperlink } from '../src/Hyperlink.ts';

it('Hyperlinks register their relationship on serialization time', async () => {
	const doc1 = Docx.fromNothing();
	await doc1.toArchive();
	expect(doc1.document.relationships.meta).toHaveLength(1);

	const doc2 = Docx.fromJsx(<Hyperlink url="http://nerf" />);
	await doc2.toArchive();
	expect(doc2.document.relationships.meta).toHaveLength(2);
});
