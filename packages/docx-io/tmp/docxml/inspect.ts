/**
 * @file
 * Dump the structure of a Docx instance to console.
 *
 * Use as;
 *   deno run --allow-read inspect.ts assets/simple.docx
 */

import { getColorizedJsxForComponent } from './lib/utilities/src/debug.ts';
import Docx, {
	type FooterXml,
	type HeaderXml,
	RelationshipType,
} from './mod.ts';

const docx = await Docx.fromArchive(Deno.args[0]);

async function jsxifyHeaderFooter(file: FooterXml | HeaderXml) {
	(await file.children).forEach((child) =>
		console.log(getColorizedJsxForComponent(child).join('\n'))
	);
}

if (Deno.args.includes('--settings')) {
	console.dir(
		docx.document.relationships.findInstance(
			(meta) => meta.type === RelationshipType.settings
		),
		{ depth: 50 }
	);
} else if (Deno.args.includes('--custom-properties')) {
	console.dir(docx.customProperties, { depth: 50 });
} else if (Deno.args.includes('--footer')) {
	const footer = await docx.document.relationships.filterInstances<FooterXml>(
		(meta) => meta.type === RelationshipType.footer
	)[1];
	await jsxifyHeaderFooter(footer);
} else if (Deno.args.includes('--header')) {
	const footer = await docx.document.relationships.filterInstances<HeaderXml>(
		(meta) => meta.type === RelationshipType.header
	)[0];
	await jsxifyHeaderFooter(footer);
} else if (Deno.args.includes('--json')) {
	console.log(JSON.stringify(await docx.document.children, null, '  '));
} else {
	console.dir(
		getColorizedJsxForComponent((await docx.document.children)[0]).join(
			'\n'
		),
		{
			depth: 50,
		}
	);
}
