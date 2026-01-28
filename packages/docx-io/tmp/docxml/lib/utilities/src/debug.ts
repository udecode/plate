import { blue, dim, green, red } from 'std/fmt/colors';

import type { AnyComponent } from '../../classes/src/Component.ts';
import type { Length } from './length.ts';

const color = {
	nodeName: red,
	propName: red,
	propValue: blue,
	syntax: green,
	text: blue,
};

function convertLengthToString(len: Length) {
	const lengths = ['cm', 'pt', 'hpt', 'twip', 'inch', 'emu'].map((unit) => ({
		unit,
		amount: len[unit as keyof Length],
	}));
	const { amount, unit } =
		lengths.find(({ amount }) => amount === Math.round(amount)) ||
		lengths[0];
	return `${amount} ${unit}`;
}

export function getColorizedJsxForComponent(comp: AnyComponent): string[] {
	const props = comp.props
		? Object.keys(comp.props)
				.filter(
					(key) =>
						comp.props[key] !== null &&
						comp.props[key] !== undefined
				)
				.map((key) => {
					const val = comp.props[key];
					return `${color.propName(key)}={${color.propValue(
						(val as Length).twip
							? convertLengthToString(val as Length)
							: JSON.stringify(val)
					)}}`;
				})
				.join(' ')
		: '';
	if (!comp.children || !comp.children.length) {
		return [
			`<${color.nodeName(comp.constructor.name)}${
				props ? ' ' + props : ''
			} />`,
		];
	}
	return [
		`<${color.nodeName(comp.constructor.name)}${props ? ' ' + props : ''}>`,
		...(comp.children || [])
			.reduce<string[]>(
				(flat, child) => [
					...flat,
					...(typeof child === 'string'
						? [`"${color.text(child)}"`]
						: getColorizedJsxForComponent(child)),
				],
				[]
			)
			.map((line) => `${dim('·')}   ${line}`),
		`</${color.nodeName(comp.constructor.name)}>`,
	];
}
