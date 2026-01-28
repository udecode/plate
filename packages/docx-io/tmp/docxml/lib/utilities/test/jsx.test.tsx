/** @jsx jsx */
import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

// deno-lint-ignore verbatim-module-syntax
import { jsx, Text } from '../../../mod.ts';
import { Component } from '../../classes/src/Component.ts';

describe('JSX', () => {
	class Comp extends Component<{ skeet: boolean; boop?: string }> {}
	it('mount a simple Component', async () => {
		// nb; removing the required prop `skeet` should give a TS warning
		expect(await (<Comp skeet />)).toEqual([new Comp({ skeet: true })]);
	});
});

describe('JSX fixing', () => {
	class Bar extends Component<{ [key: string]: never }, string> {
		static override children = [];
		static override mixed = true;
	}

	class Foo extends Component<{ [key: string]: never }, Text | Bar> {
		static override children = [Text.name, Bar.name];
		static false = true;
	}

	it('splits invalid node nesting', async () => {
		expect(
			await (
				<Foo>
					<Bar>
						a<Bar>b</Bar>c
					</Bar>
				</Foo>
			)
		).toEqual([
			new Foo({}, new Bar({}, 'a'), new Bar({}, 'b'), new Bar({}, 'c')),
		]);
	});

	it('splits invalid node nesting II', async () => {
		expect(
			await (
				<Bar>
					a<Bar>b</Bar>c
				</Bar>
			)
		).toEqual([new Bar({}, 'a'), new Bar({}, 'b'), new Bar({}, 'c')]);
	});

	it('wraps stray text nodes in <Text>', async () => {
		expect(await (<Foo>bar</Foo>)).toEqual(
			await (
				<Foo>
					<Text>bar</Text>
				</Foo>
			)
		);
		expect(await (<Foo>bar</Foo>)).toEqual([
			new Foo({}, new Text({}, 'bar')),
		]);
	});

	it('cleans up empty <Text>', async () => {
		expect(
			await (
				<Text>
					<Text>bar</Text>
					<Text />
				</Text>
			)
		).toEqual(await (<Text>bar</Text>));
	});

	it('inherits formatting options onto <Text>', async () => {
		expect(
			await (
				<Foo>
					<Text isItalic isBold>
						Beep
						{
							// JSX Keep this text node
							' '
						}
						<Text>boop</Text>
						{
							// JSX Keep this text node
							' '
						}
						baap
					</Text>
				</Foo>
			)
		).toEqual(
			await (
				<Foo>
					<Text isItalic isBold>
						Beep{' '}
					</Text>
					<Text isItalic isBold>
						boop
					</Text>
					<Text isItalic isBold>
						{' '}
						baap
					</Text>
				</Foo>
			)
		);
	});
});
