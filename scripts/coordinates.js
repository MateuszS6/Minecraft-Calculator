/** @param {HTMLInputElement[]} inputs */
export function readPoints(inputs) {
	const values = inputs.map(input => input.valueAsNumber);

	const invalid = inputs.find((input, index) =>
		input.validity.badInput ||
		(input.value !== "" &&
			(!input.validity.valid || !Number.isSafeInteger(values[index]))
		)
	);

	if (invalid) {
		return {
			error: invalid.validationMessage ||
				"Enter whole block coordinates within the supported range."
		};
	}

	return {
		point: inputs.some(input => input.value === "") ? null : values
	};
}
