import { describe } from 'std/testing/bdd';

import { hpt, opt, pt, twip } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../src/table-properties.ts';

const test = createXmlRoundRobinTest<TableProperties>(
	tablePropertiesFromNode,
	tablePropertiesToNode
);

const date = new Date();

describe('Table formatting', () => {
	test(
		`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:tblStyle w:val="afkicken-van-de-opkikkers" />
			<w:tblW w:w="1200" w:type="dxa" />
			<w:tblLook
				w:firstColumn="1"
				w:firstRow="1"
				w:lastColumn="1"
				w:lastRow="1"
				w:noHBand="1"
				w:noVBand="1"
			/>
			<w:tblCellMar>
				<w:top w:w="720" w:type="dxa" />
				<w:start w:w="432" w:type="dxa" />
				<w:bottom w:w="0" w:type="dxa" />
				<w:end w:w="144" w:type="dxa" />
			</w:tblCellMar>
			<w:tblBorders>
				<w:top w:sz="8" w:space="1" w:color="red" />
				<w:end w:val="seattle" w:space="1" w:color="red" />
				<w:bottom w:val="peopleHats" w:sz="8" w:color="red" />
				<w:start w:val="dashed" w:sz="8" w:space="1" />
				<w:insideH w:val="heartBalloon" w:sz="8" w:space="1" w:color="red" />
			</w:tblBorders>
			<w:tblLayout w:type="fixed" />
			<w:tblInd w:w="100" w:type="dxa" />
			<w:tblCellSpacing w:w="60" w:type="dxa" />
			<w:tblStyleRowBandSize w:val="2" />
			<w:tblStyleColBandSize w:val="3" />
			<w:tblPrChange w:id="0" w:author="Vincent" w:date="${date.toISOString()}">
				<w:tblPr>
					<w:tblStyle w:val="LightList"/>
					<w:tblW w:w="1400" w:type="dxa"/>
				</w:tblPr>
			</w:tblPrChange>
		</w:tblPr>`,
		{
			style: 'afkicken-van-de-opkikkers',
			width: { length: '1200', unit: 'dxa' },
			activeConditions: {
				firstColumn: true,
				firstRow: true,
				lastColumn: true,
				lastRow: true,
				noHBand: true,
				noVBand: true,
			},
			indentation: pt(5),
			cellSpacing: pt(3),
			cellPadding: {
				top: twip(720),
				bottom: twip(0),
				start: twip(432),
				end: twip(144),
			},
			rowBandingSize: 2,
			columnBandingSize: 3,
			borders: {
				top: { type: null, width: opt(8), spacing: 1, color: 'red' },
				end: { type: 'seattle', width: null, spacing: 1, color: 'red' },
				bottom: {
					type: 'peopleHats',
					width: pt(1),
					spacing: null,
					color: 'red',
				},
				start: {
					type: 'dashed',
					width: hpt(2),
					spacing: 1,
					color: null,
				},
				insideH: {
					type: 'heartBalloon',
					width: twip(20),
					spacing: 1,
					color: 'red',
				},
				insideV: null,
			},
			strictColumnWidths: true,
			change: {
				id: 0,
				author: 'Vincent',
				date: date,
				style: 'LightList',
				width: { length: '1400', unit: 'dxa' },
			},
		}
	);

	describe('Legacy schema for cellPadding', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblCellMar>
					<w:left w:w="432" w:type="dxa" />
					<w:right w:w="144" w:type="dxa" />
				</w:tblCellMar>
			</w:tblPr>`,
			{
				cellPadding: {
					top: null,
					bottom: null,
					start: twip(432),
					end: twip(144),
				},
			}
		);
	});

	describe('Setting table width to a "%" string', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblW w:w="100%" w:type="nil" />
			</w:tblPr>`,
			{
				width: { length: '100%', unit: 'nil' },
			}
		);
	});

	describe('Setting table width to an unannotated value', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
					<w:tblW w:w="420" w:type="nil" />
				</w:tblPr>`,
			{
				width: { length: '420', unit: 'nil' },
			}
		);
	});

	describe('Legacy "left"/"right"', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblBorders>
					<w:left w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:right w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tblBorders>
			</w:tblPr>`,
			{
				borders: {
					start: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					end: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					top: null,
					bottom: null,
					insideH: null,
					insideV: null,
				},
			}
		);
	});
});
