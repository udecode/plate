/**
 * A function that can be used to test that all the parameters of an object pass
 * a particular test. This can be used to check that no values in an object are NaN,
 * or could be used to check that values are inside a particular range.
 *
 * @param objectToCheck An object whose parameters we want to validate.
 *
 * @param callback A callback function that we use to check the values of our object.
 * The callback will be used recursively if objectToCheck has nested values.
 *
 * @param callbackFailureValue The boolean value that will indicate a failure of the callback function.
 *
 * @returns Returns `true` if all the object's values pass the check between the callback function and
 * the value that determines a failure. Otherwise, throws an error.
 *
 * @todo Add a better means of validating that the values used to generate ooxml are, in fact,
 * constrained in the ways we think they should be.
 */

export function checkForForbiddenParameters<ObjectToCheck>(
	objectToCheck: ObjectToCheck,
	callback: (object: unknown) => boolean,
	callbackFailureValue: boolean
): true {
	type propObject = { prop: string; value: unknown };
	const values: propObject[] = [];
	// Recurse through an object and flatten it to key-value pairs.
	const flattenedObject = (
		deepObject: unknown,
		accumulator: propObject[]
	) => {
		if (typeof deepObject === 'object') {
			for (const key in deepObject) {
				if (typeof deepObject[key as keyof unknown] === 'object') {
					flattenedObject(
						deepObject[key as keyof unknown],
						accumulator
					);
				} else {
					accumulator.push({
						prop: key,
						value: deepObject[key as keyof unknown],
					});
				}
			}
		}
		return accumulator;
	};

	// Iterate over an object's values until we hit one that causes the callback
	// function to equal the failure value.
	const flattenedObjectArray = flattenedObject(objectToCheck, values);
	flattenedObjectArray.forEach((entry) => {
		const { prop, value } = entry;
		if (callback(value) === callbackFailureValue) {
			throw new Error(
				`Error when checking parameters.\nCallback for { ${prop}: ${value} } returned ${callback(
					value
				)}.`
			);
		}
	});
	return true;
}

/**
 * A function to check if any arbitrary property of an object is `NaN`. Intended to be used as a
 * possible callback for the `checkForForbiddenParameters` function in case we want to detect `NaN`.
 */
export function isValidNumber(objectProperty: unknown): boolean {
	return typeof objectProperty === 'number' && Number.isNaN(objectProperty);
}
