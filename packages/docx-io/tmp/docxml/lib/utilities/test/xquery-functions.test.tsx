/** @jsx Docx.jsx */
import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import { Cell } from '../../components/document/src/Cell.ts';
import { Row } from '../../components/document/src/Row.ts';
import { Table } from '../../components/document/src/Table.ts';
import { Docx } from '../../Docx.ts';
import { parse } from '../src/dom.ts';
import { cm, emu, hpt, inch, pt, twip } from '../src/length.ts';
import { NamespaceUri, QNS } from '../src/namespaces.ts';
import {
	evaluateXPath,
	evaluateXPathToMap,
	evaluateXPathToNumber,
} from '../src/xquery.ts';

describe('XQuery functions', () => {
	it('docxml:length', () => {
		// In XPath an empty sequence equals null. Fontoxpath returns an empty sequence as an empty paragraph
		expect(evaluateXPath(`docxml:length((), "pt")`)).toEqual([]);

		expect(evaluateXPath(`docxml:length(10, "pt")`)).toEqual(pt(10));
		expect(evaluateXPath(`docxml:length(10, "emu")`)).toEqual(emu(10));
		expect(evaluateXPath(`docxml:length(10, "hpt")`)).toEqual(hpt(10));
		expect(evaluateXPath(`docxml:length(10, "twip")`)).toEqual(twip(10));
		expect(evaluateXPath(`docxml:length(10, "cm")`)).toEqual(cm(10));
		expect(evaluateXPath(`docxml:length(10, "inch")`)).toEqual(inch(10));
	});

	it('docxml:cell-column', async () => {
		// @TODO isolate this unit test from JSX and the Table/Row/Cell classes. Use OOXML for scaffolding instead.
		const archive = await Docx.fromJsx(
			<Table>
				<Row>
					<Cell />
					<Cell colSpan={2} />
					<Cell />
				</Row>
			</Table>
		).toArchive();
		const dom = await archive.readXml('word/document.xml');
		expect(
			evaluateXPathToNumber(`docxml:cell-column(//${QNS.w}tc[1])`, dom)
		).toBe(0);
		expect(
			evaluateXPathToNumber(`docxml:cell-column(//${QNS.w}tc[2])`, dom)
		).toBe(1);
		expect(
			evaluateXPathToNumber(`docxml:cell-column(//${QNS.w}tc[3])`, dom)
		).toBe(3);
	});

	it('docxml:ct-shd', () => {
		const dom = parse(
			`<x
				xmlns:w="${NamespaceUri.w}"
				w:fill="abc123"
				w:color="def456"
				w:val="thinDiagCross"
			/>`
		);
		expect(evaluateXPathToMap(`docxml:ct-shd(/*)`, dom)).toEqual({
			background: 'abc123',
			foreground: 'def456',
			pattern: 'thinDiagCross',
		});
	});

	it('docxml:ct-on-off', () => {
		const dom = parse(
			`<x xmlns:w="${NamespaceUri.w}">
				<a />
				<b w:val="efwrgtr" />
				<c w:val="true" />
			</x>`
		);
		expect(evaluateXPath(`docxml:ct-on-off(/x/a)`, dom)).toBe(true);
		expect(evaluateXPath(`docxml:ct-on-off(/x/b)`, dom)).toBe(false);
		expect(evaluateXPath(`docxml:ct-on-off(/x/c)`, dom)).toBe(true);
		expect(evaluateXPath(`docxml:ct-on-off(/x/d)`, dom)).toBe(false);
	});

	it('docxml:st-on-off', () => {
		expect(evaluateXPath(`docxml:st-on-off("true")`)).toBe(true);
		expect(evaluateXPath(`docxml:st-on-off("1")`)).toBe(true);
		expect(evaluateXPath(`docxml:st-on-off("on")`)).toBe(true);
		expect(evaluateXPath(`docxml:st-on-off("TRUE")`)).toBe(false);
		expect(evaluateXPath(`docxml:st-on-off("false")`)).toBe(false);
	});
});
