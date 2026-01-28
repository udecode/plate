import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { NumberMap } from '../src/NumberMap.ts';

describe('NumberMap', () => {
	const map = new NumberMap<boolean>();

	it('.add', () => {
		map.set(1, true);
		expect(map.add(true)).toBe(0);
		expect(map.add(true)).toBe(2);
	});

	it('.array', () => {
		expect(map.array()).toEqual([true, true, true]);
	});
});
