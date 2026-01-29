import {
	checkForForbiddenParameters,
	isValidNumber,
} from '../../utilities/src/parameter-checking.ts';

/**
 * An object that describes a size or length in various cross-computable units. Useful for telling the
 * library how centimeters you would like one thing to be, while the one thing is defined as twentieth-
 * points, EMU's or ostriches behind the scenes.
 *
 * See also the functions {@link cm}, {@link pt}, {@link hpt}, {@link twip} and {@link inch}.
 */
export type Length = {
	/**
	 * Points.
	 *
	 * Defined as 1/72th of an inch.
	 */
	pt: number;
	/**
	 * English metric units.
	 *
	 * Defined as 1/360000th of a centimeter.
	 */
	emu: number;
	/**
	 * Half-points.
	 *
	 * Defined as 1/2nd of a point.
	 */
	hpt: number;

	/**
	 * 1/8th points.
	 *
	 * Defined as 1/8th of a point.
	 */
	opt: number;

	/**
	 * Twentieth of a point. Sometimes also called DXA.
	 *
	 * Defined as 1/20th of a point.
	 */
	twip: number;
	/**
	 * Centimeters.
	 */
	cm: number;
	/**
	 * Inch.
	 *
	 * Defined as exactly 2.54 centimeters.
	 */
	inch: number;
};

function _convert(points: number): Length {
	// Ensure points is not NaN
	checkForForbiddenParameters(points, isValidNumber, true);
	return {
		pt: points,
		emu: points * 12700,
		hpt: points * 2,
		opt: points * 8,
		twip: points * 20,
		inch: points * (1 / 72),
		cm: points * (2.54 / 72),
	};
}

/**
 * Converts points to any of the other units of length.
 */
export function pt(amount: number): Length {
	return _convert(amount);
}

/**
 * Converts English metric units to any of the other units of length.
 */
export function emu(amount: number): Length {
	return _convert(amount / 12700);
}

/**
 * Converts half-points to any of the other units of length.
 */
export function hpt(amount: number): Length {
	return _convert(amount / 2);
}

/**
 * Converts 8th-points to any of the other units of length.
 */
export function opt(amount: number): Length {
	return _convert(amount / 8);
}

/**
 * Converts twentieth-points to any of the other units of length.
 */
export function twip(amount: number): Length {
	return _convert(amount / 20);
}

/**
 * Converts centimeters to any of the other units of length.
 */
export function cm(amount: number): Length {
	return _convert(amount / (2.54 / 72));
}

/**
 * Converts inches to any of the other units of length.
 */
export function inch(amount: number): Length {
	return _convert(amount / (1 / 72));
}

const ingestors: { [unit: string]: (v: number) => Length } = {
	cm,
	pt,
	hpt,
	opt,
	inch,
	twip,
	emu,
};

export function convert(value: number, unit: string) {
	const ingestor = ingestors[unit];
	if (!ingestor) {
		throw new Error(`Unknown unit "${unit}"`);
	}
	return ingestor(value);
}
