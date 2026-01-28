import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import { Archive } from '../../classes/src/Archive.ts';
import type { ComponentContext } from '../../classes/src/Component.ts';
import { getChangeInformation } from '../src/changes.ts';
import { create } from '../src/dom.ts';
import { NamespaceUri } from '../src/namespaces.ts';

describe('changes', () => {
	const date = new Date();

	const emptyContext: ComponentContext = {
		archive: new Archive(),
		relationships: null,
	};

	it('Returns the expected changes information', () => {
		const node = create(
			`<w:moveTo xmlns:w="${
				NamespaceUri.w
			}" w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
                <w:r>
                    <w:t xml:space="preserve">This is a paragraph</w:t>
                </w:r>
            </w:moveTo>`,
			emptyContext
		);

		const changeInformation = getChangeInformation(node);
		expect(changeInformation).toEqual({
			id: 0,
			author: 'Gabe',
			date: date,
		});
	});

	it('Returns the expected changes information from a node without date', () => {
		const node = create(
			`<w:moveTo xmlns:w="${NamespaceUri.w}" w:id="0" w:author="Gabe">
                <w:r>
                    <w:t xml:space="preserve">This is a paragraph</w:t>
                </w:r>
            </w:moveTo>`,
			emptyContext
		);

		const changeInformation = getChangeInformation(node);
		expect(changeInformation).toEqual({
			id: 0,
			author: 'Gabe',
		});
	});

	it('Returns the expected changes information from a node without author', () => {
		const node = create(
			`<w:moveTo xmlns:w="${
				NamespaceUri.w
			}" w:id="0" w:date="${date.toISOString()}" >
                <w:r>
                    <w:t xml:space="preserve">This is a paragraph</w:t>
                </w:r>
            </w:moveTo>`,
			emptyContext
		);

		const changeInformation = getChangeInformation(node);
		expect(changeInformation).toEqual({
			id: 0,
			date: date,
		});
	});

	it('Returns the expected changes information from a node without author and date', () => {
		const node = create(
			`<w:moveTo xmlns:w="${NamespaceUri.w}" w:id="0" >
                <w:r>
                    <w:t xml:space="preserve">This is a paragraph</w:t>
                </w:r>
            </w:moveTo>`,
			emptyContext
		);

		const changeInformation = getChangeInformation(node);
		expect(changeInformation).toEqual({
			id: 0,
		});
	});
});
