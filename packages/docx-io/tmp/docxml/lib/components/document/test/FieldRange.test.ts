import { expect } from 'std/expect';
import { describe } from 'std/testing/bdd';

import {
	type FieldNames,
	FieldDefinition,
	FieldRangeEnd,
	FieldRangeStart,
} from '../../../../mod.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri, QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToString } from '../../../utilities/src/xquery.ts';

describe('FieldDefinition', () => {
	const newFieldDefNode = create(
		`<w:instrText xmlns:w="${NamespaceUri.w}">HYPERLINK http://www.github.com \\*</w:instrText>`
	);

	describe('FieldDefinition from node', () => {
		const newFieldDef = FieldDefinition.fromNode(newFieldDefNode);
		expect(newFieldDef.props.name).toBe('HYPERLINK');
	});

	describe('FieldDefinition to node', () => {
		const newFieldDef = new FieldDefinition({
			name: 'HYPERLINK' as FieldNames,
			value: 'http://wwww.google.com?',
		}).toNode();

		expect(serialize(newFieldDef)).toBe(
			'HYPERLINK http://wwww.google.com? \\*'
		);
	});
});

describe('FieldRangeStart', () => {
	const newFieldRangeNode = create(
		`<w:fldChar xmlns:w="${NamespaceUri.w}" w:fldCharType="begin" w:dirty="true" w:fldLock="true"/>`
	);

	describe('FieldRangeStart from node', () => {
		const newFieldRange = FieldRangeStart.fromNode(newFieldRangeNode);
		expect(newFieldRange.props.isDirty).toBe(true);
		expect(newFieldRange.props.isLocked).toBe(true);
	});

	describe('FieldRangeStart from object', () => {
		const newFieldRange = new FieldRangeStart({
			isDirty: false,
			isLocked: false,
		}).toNode([]);
		const fieldRangeType = evaluateXPathToString(
			`./@${QNS.w}fldCharType`,
			newFieldRange
		);
		expect(fieldRangeType).toBe('begin');
	});
});

describe('FieldRangeEnd', () => {
	describe('FieldRangeEnd from node', () => {
		const newFieldRange = FieldRangeEnd.fromNode();
		expect(newFieldRange).toEqual(new FieldRangeEnd({}));
	});

	describe('FieldRangeEnd from object', () => {
		const newFieldRange = new FieldRangeEnd({}).toNode([]);
		const fieldRangeType = evaluateXPathToString(
			`./@${QNS.w}fldCharType`,
			newFieldRange
		);
		expect(fieldRangeType).toBe('end');
	});
});
