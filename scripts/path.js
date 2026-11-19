import { readPoints } from "./coordinates.js";

function calculateRoute(start, destination) {
	const [dx, dy, dz] = destination.map((value, index) => value - start[index]);
	const horizontal = [[dx, "East", "West"], [dz, "South", "North"]];
	horizontal.sort(([a], [b]) => Math.abs(b) - Math.abs(a));

	const steps = [...horizontal, [dy, "Up", "Down"]]
		.filter(([amount]) => amount !== 0)
		.map(([amount, positive, negative]) =>
			`${Math.abs(amount)} ${amount > 0 ? positive : negative}`
		);

	return {
		steps,
		displacement: [dx, dy, dz],
		straightLine: Math.hypot(dx, dy, dz),
		axisDistance: Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
	};
}

export function initPathModule() {
	const startInputs = ["x1-input", "y1-input", "z1-input"]
		.map(id => document.getElementById(id));
	const destinationInputs = ["x2-input", "y2-input", "z2-input"]
		.map(id => document.getElementById(id));

	const inputs = [...startInputs, ...destinationInputs];
	const stats = document.getElementById("route-stats");
	const message = document.getElementById("route-message");
	const stepsResult = document.getElementById("follow-result");
	const displacementResult = document.getElementById("displacement-result");
	const distanceResult = document.getElementById("distance-result");
	const axisResult = document.getElementById("axis-result");

	function updateRoute() {
		const start = readPoints(startInputs);
		const destination = readPoints(destinationInputs);

		stats.hidden = true;
		message.hidden = false;

		if (!start.point || !destination.point) {
			message.textContent = start.error || destination.error ||
				"Enter both points to see the route.";
			return;
		}

		const route = calculateRoute(start.point, destination.point);

		if (!Number.isSafeInteger(route.axisDistance)) {
			message.textContent = "The points are too far apart to calculate precisely.";
			return;
		}

		stepsResult.textContent = route.steps.join(", ") || "Same location";
		displacementResult.textContent = route.displacement
			.map(value => value > 0 ? `+${value}` : value)
			.join(" ");
		distanceResult.textContent = `${route.straightLine.toFixed(2)} blocks`;
		axisResult.textContent = `${route.axisDistance} blocks`;

		message.hidden = true;
		stats.hidden = false;
	}

	function clearPoint(group) {
		group.forEach(input => { input.value = ""; });
		updateRoute();
		group[0].focus();
	}

	inputs.forEach(input => input.addEventListener("input", updateRoute));

	document.getElementById("clear-start-button").addEventListener("click", () => {
		clearPoint(startInputs);
	});

	document.getElementById("clear-destination-button").addEventListener("click", () => {
		clearPoint(destinationInputs);
	});

	document.getElementById("route-example").addEventListener("click", () => {
		const example = [0, 64, 0, 3, 64, 4];
		inputs.forEach((input, index) => { input.value = String(example[index]); });
		updateRoute();
	});

	updateRoute();
}