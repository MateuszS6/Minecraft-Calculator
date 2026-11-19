import { readPoints } from "./coordinates.js";

const yRanges = {
	Overworld: [-62, 316],
	Nether: [2, 123]
}

/**
 * @param {number[]} point
 * @param {"Overworld" | "Nether"} from
 * @returns {number[]}
 */
function convertPoint([x, y, z], from) {
	if (from === "Nether") return [x * 8, y, z * 8];

	const [min, max] = yRanges.Nether;
	return [
		Math.floor(x / 8),
		Math.min(max, Math.max(min, y)), // Clamp to height limits
		Math.floor(z / 8)
	];
}

export function initConversionModule() {
	const inputs = ["x-input", "y-input", "z-input"].map(id => /** @type {HTMLInputElement} */(document.getElementById(id)));
	const yInput = inputs[1];
	const result = document.getElementById("conversion");
	const resultPanel = document.getElementById("portal-result");
	const message = document.getElementById("portal-message");
	/** @type {HTMLButtonElement} */
	const copyButton = document.getElementById("copy-button");
	const copyStatus = document.getElementById("copy-status");
	/** @type {"Overworld" | "Nether"} */
	let from = "Overworld";

	function updateConversion() {
		const { point, error } = readPoints(inputs);

		copyStatus.textContent = "";
		copyButton.disabled = true;
		result.textContent = "—"

		if (!point) {
			message.textContent = error || "Enter X, Y and Z to see the result.";
			return;
		}

		const converted = convertPoint(point, from);

		if (!converted.every(Number.isSafeInteger)) {
			message.textContent = "The converted coordinates are too large.";
			return;
		}

		result.textContent = converted.join(" ");
		message.textContent = point[1] === converted[1]
			? ""
			: `Suggested Y adjusted from ${point[1]} to ${converted[1]}.`;
		copyButton.disabled = false;
	}

	function updateDirection() {
		const to = from === "Overworld" ? "Nether" : "Overworld";
		const [min, max] = yRanges[from];

		document.getElementById("mode-text").textContent = `${from} → ${to}`;
		document.getElementById("input-dimension").textContent = from;
		document.getElementById("output-dimension").textContent = to;
		document.getElementById("y-range").textContent = `Y range for this tool: ${min} to ${max}.`;
		resultPanel.dataset.dimension = to;
		yInput.min = String(min);
		yInput.max = String(max);

		updateConversion();
	}

	// Activate input listeners
	inputs.forEach(input => input.addEventListener("input", updateConversion));

	document.getElementById('reverse-button').addEventListener("click", () => {
		from = from === "Overworld" ? "Nether" : "Overworld";
		updateDirection();
	});

	document.getElementById('clear-button').addEventListener("click", () => {
		inputs.forEach(input => { input.value = ""; });
		updateConversion();
	});

	document.getElementById("portal-example").addEventListener("click", () => {
		const example = from === "Overworld" ? [-9, 140, 800] : [-2, 64, 100];
		inputs.forEach((input, index) => { input.value = String(example[index]); });
		updateConversion();
	})

	copyButton.addEventListener("click", async () => {
		const coordinates = result.textContent ?? "";

		try {
			await navigator.clipboard.writeText(coordinates);
			copyStatus.textContent = `Copied ${coordinates}.`;
		} catch {
			copyStatus.textContent = "Copy failed. You can select the coordinates manually.";
		}
	});

	updateDirection();
}
