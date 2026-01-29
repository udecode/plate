import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { MoveFromRangeEnd } from '../src/MoveFromRangeEnd.ts';
import { MoveToRangeEnd } from '../src/MoveToRangeEnd.ts';

describe('MoveToRangeStart and MoveFromRangeStart elements...', () => {
	const moveToRangeEnd = MoveToRangeEnd.fromNode(
		create(`<w:moveToRangeEnd xmlns:w="${NamespaceUri.w}" w:id="0" />`)
	);

	const moveFromRangeEnd = MoveFromRangeEnd.fromNode(
		create(`<w:moveFromRangeEnd xmlns:w="${NamespaceUri.w}" w:id="1" />`)
	);
	it('Create MoveToRangeEnd from node', () => {
		expect(moveToRangeEnd.props.id).toBe(0);
	});

	it('Create MoveFromRangeEnd from node', () => {
		expect(moveFromRangeEnd.props.id).toBe(1);
	});

	it('Create MoveToRangeEnd node from MoveRangeEnd object', () => {
		const toRangeObject = new MoveToRangeEnd({
			id: 2,
		});

		expect(serialize(toRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveToRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="2" />`
				)
			)
		);

		const fromRangeObject = new MoveFromRangeEnd({
			id: 3,
		});
		expect(serialize(fromRangeObject.toNode())).toBe(
			serialize(
				create(
					`<moveFromRangeEnd xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:id="3" />`
				)
			)
		);
	});
});
