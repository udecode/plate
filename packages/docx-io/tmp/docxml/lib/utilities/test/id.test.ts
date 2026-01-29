import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import { hex, int } from '../src/id.ts';

describe('Id', () => {
	it('int', () => {
		expect(int(1).int).toEqual(1);
		expect(int(1).hex).toEqual('00000001');
	});

	it('hex', () => {
		expect(hex('FFFFFFFF').int).toEqual(4294967295);
		expect(hex('FFFFFFFF').hex).toEqual('FFFFFFFF');
	});
});
