import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Paragraph } from '../../document/src/Paragraph.ts';
import { Text } from '../../document/src/Text.ts';
import { MoveFrom } from '../src/MoveFrom.ts';
import { MoveTo } from '../src/MoveTo.ts';

describe('Move content in track changes...', () => {
	const date = new Date();

	const emptyContext: ComponentContext = {
		archive: new Archive(),
		relationships: null,
	};

	const moveToNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);

	const moveToNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:date="${date.toISOString()}">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);
	const moveToNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:moveTo w:id="0" w:author="Gabe">
				<w:r>
					<w:t xml:space="preserve">This is a paragraph</w:t>
				</w:r>
			</w:moveTo>
		</w:p>`,
		emptyContext
	);

	const moveFromNode = create(
		`<w:moveFrom xmlns:w="${
			NamespaceUri.w
		}" w:id="1" w:author="Angel" w:date="${date.toISOString()}">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveFromNodeWithoutAuthor = create(
		`<w:moveFrom xmlns:w="${
			NamespaceUri.w
		}" w:id="1" w:date="${date.toISOString()}">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveFromNodeWithoutDate = create(
		`<w:moveFrom xmlns:w="${NamespaceUri.w}" w:id="1" w:author="Angel">
            <w:r>
                <w:t xml:space="preserve">This is a moveFrom node.</w:t>
            </w:r>
		</w:moveFrom>`,
		emptyContext
	);

	const moveToAsPropNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:author="Luis" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveToAsPropNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveToAsPropNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveTo w:id="1" w:author="Luis" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>Hello this is some text.</w:t>
			</w:r>
		</w:p>`
	);

	const moveFromAsPropNode = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:author="Ines" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);
	const moveFromAsPropNodeWithoutAuthor = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:date="${date.toISOString()}" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);
	const moveFromAsPropNodeWithoutDate = create(
		`<w:p xmlns:w="${NamespaceUri.w}">
			<w:pPr>
				<w:rPr>
					<w:moveFrom w:id="2" w:author="Ines" />
				</w:rPr>
			</w:pPr>
			<w:r>
				<w:t>I'm just a poor boy</w:t>
			</w:r>
		</w:p>`
	);

	// Testing a move inside a paragraph.
	const moveToObject = new Paragraph(
		{ style: null },
		new MoveTo(
			{
				id: 0,
				date: date,
				author: 'Gabe',
			},
			new Text({}, 'This is a paragraph')
		)
	);

	const moveToObjectWithoutDate = new Paragraph(
		{ style: null },
		new MoveTo(
			{
				id: 0,
				author: 'Gabe',
			},
			new Text({}, 'This is a paragraph')
		)
	);

	const moveToObjectWithoutAuthor = new Paragraph(
		{ style: null },
		new MoveTo(
			{
				id: 0,
				date: date,
			},
			new Text({}, 'This is a paragraph')
		)
	);

	// Testing a move as a stand-alone object
	const moveFromObject = new MoveFrom(
		{
			id: 1,
			date: date,
			author: 'Angel',
		},
		new Text({}, 'This is a moveFrom node.')
	);

	const moveFromObjectWithoutAuthor = new MoveFrom(
		{
			id: 1,
			date: date,
		},
		new Text({}, 'This is a moveFrom node.')
	);
	const moveFromObjectWithoutDate = new MoveFrom(
		{
			id: 1,
			author: 'Angel',
		},
		new Text({}, 'This is a moveFrom node.')
	);

	const moveToAsPropObject = new Paragraph(
		{
			pilcrow: {
				moveTo: {
					author: 'Luis',
					date: date,
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveToAsPropObjectWithoutAuthor = new Paragraph(
		{
			pilcrow: {
				moveTo: {
					date: date,
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveToAsPropObjectWithoutDate = new Paragraph(
		{
			pilcrow: {
				moveTo: {
					author: 'Luis',
					id: 1,
				},
			},
		},
		new Text({}, 'Hello this is some text.')
	);

	const moveFromAsPropObject = new Paragraph(
		{
			pilcrow: {
				moveFrom: {
					id: 2,
					author: 'Ines',
					date: date,
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	const moveFromAsPropObjectWithoutAuthor = new Paragraph(
		{
			pilcrow: {
				moveFrom: {
					id: 2,
					date: date,
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	const moveFromAsPropObjectWithoutDate = new Paragraph(
		{
			pilcrow: {
				moveFrom: {
					id: 2,
					author: 'Ines',
				},
			},
		},
		new Text({}, "I'm just a poor boy")
	);

	// MoveTo as an object
	const newMoveTo = Paragraph.fromNode(moveToNode, emptyContext);
	const newMoveToWithoutAuthor = Paragraph.fromNode(
		moveToNodeWithoutAuthor,
		emptyContext
	);
	const newMoveToWithoutDate = Paragraph.fromNode(
		moveToNodeWithoutDate,
		emptyContext
	);

	// MoveFrom as an object
	const newMoveFrom = MoveFrom.fromNode(moveFromNode, emptyContext);
	const newMoveFromWithoutAuthor = MoveFrom.fromNode(
		moveFromNodeWithoutAuthor,
		emptyContext
	);
	const newMoveFromWithoutDate = MoveFrom.fromNode(
		moveFromNodeWithoutDate,
		emptyContext
	);

	// MoveTo as property
	const newMoveToAsProp = Paragraph.fromNode(moveToAsPropNode, emptyContext);
	const newMoveToAsPropWithoutAuthor = Paragraph.fromNode(
		moveToAsPropNodeWithoutAuthor,
		emptyContext
	);
	const newMoveToAsPropWithoutDate = Paragraph.fromNode(
		moveToAsPropNodeWithoutDate,
		emptyContext
	);

	// MoveFrom as property
	const newMoveFromAsProp = Paragraph.fromNode(
		moveFromAsPropNode,
		emptyContext
	);
	const newMoveFromAsPropWithoutAuthor = Paragraph.fromNode(
		moveFromAsPropNodeWithoutAuthor,
		emptyContext
	);
	const newMoveFromAsPropWithoutDate = Paragraph.fromNode(
		moveFromAsPropNodeWithoutDate,
		emptyContext
	);

	it('turns node into expected Move objects', () => {
		expect(newMoveTo).toEqual(moveToObject);
		expect(newMoveToWithoutAuthor).toEqual(moveToObjectWithoutAuthor);
		expect(newMoveToWithoutDate).toEqual(moveToObjectWithoutDate);

		expect(newMoveFrom).toEqual(moveFromObject);
		expect(newMoveFromWithoutAuthor).toEqual(moveFromObjectWithoutAuthor);
		expect(newMoveFromWithoutDate).toEqual(moveFromObjectWithoutDate);

		expect(newMoveToAsProp.props.pilcrow?.moveTo).toEqual(
			moveToAsPropObject.props.pilcrow?.moveTo
		);
		expect(newMoveToAsPropWithoutAuthor.props.pilcrow?.moveTo).toEqual(
			moveToAsPropObjectWithoutAuthor.props.pilcrow?.moveTo
		);
		expect(newMoveToAsPropWithoutDate.props.pilcrow?.moveTo).toEqual(
			moveToAsPropObjectWithoutDate.props.pilcrow?.moveTo
		);

		expect(newMoveFromAsProp.props.pilcrow?.moveFrom).toEqual(
			moveFromAsPropObject.props.pilcrow?.moveFrom
		);
		expect(newMoveFromAsPropWithoutAuthor.props.pilcrow?.moveFrom).toEqual(
			moveFromAsPropObjectWithoutAuthor.props.pilcrow?.moveFrom
		);
		expect(newMoveFromAsPropWithoutDate.props.pilcrow?.moveFrom).toEqual(
			moveFromAsPropObjectWithoutDate.props.pilcrow?.moveFrom
		);
	});

	it('serializes and deserialized correctly', async () => {
		expect(serialize(await moveToObject.toNode([]))).toEqual(
			serialize(
				create(
					`<p xmlns="${NamespaceUri.w}">
						<pPr/>
						<moveTo xmlns:ns1="${NamespaceUri.w}" 
							ns1:id="0" ns1:date="${date.toISOString()}" ns1:author="Gabe">
						<r>
							<t xml:space="preserve">This is a paragraph</t>
						</r>
					</moveTo>
					</p>`
				)
			)
		);
	});

	it('turns object of a moveFrom into the a <moveFrom> node', async () => {
		expect(serialize(await moveFromObject.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:date="${date.toISOString()}" ns1:author="Angel" >
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);

		expect(serialize(await moveFromObjectWithoutAuthor.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:date="${date.toISOString()}">
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);

		expect(serialize(await moveFromObjectWithoutDate.toNode([]))).toEqual(
			serialize(
				create(
					`<moveFrom 
						xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}"
						ns1:id="1" ns1:author="Angel">
						<r>
							<t xml:space="preserve" >This is a moveFrom node.</t>
						</r>
					</moveFrom>`
				)
			)
		);
	});
});
