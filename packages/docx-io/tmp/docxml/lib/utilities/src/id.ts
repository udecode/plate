import {
	checkForForbiddenParameters,
	isValidNumber,
} from './parameter-checking.ts';

/**
 * An object that describes an identifier.
 *
 * See also the functions {@link hex} and {@link int}.
 */
export type Id = {
	/**
	 * Hexadecimal.
	 *
	 * Defined as a 4 byte hexadecimal number.
	 */
	hex: string;
	/**
	 * Integer.
	 *
	 * Defined as an integer value.
	 */
	int: number;
};

function _convert(int: number): Id {
	// Ensure points is not NaN
	checkForForbiddenParameters(int, isValidNumber, true);
	return {
		hex: int.toString(16).padStart(8, '0').toUpperCase(),
		int,
	};
}

/**
 * Converts hexadecimal values to any of the other units of Id.
 */
export function hex(hex: string): Id {
	return _convert(parseInt(hex, 16));
}

/**
 * Converts integers to any of the other units of Id.
 */
export function int(int: number): Id {
	return _convert(int);
}
