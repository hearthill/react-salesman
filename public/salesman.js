findBest = function(graph, visited, distance) {
	if (visited.length === graph.length) {
		return {route: visited, distance: distance};
	}
	let best = null;
	let bestDistance = null;
	for (let i = 0; i < graph.length; i++) {
		if (visited.indexOf(i) < 0 && graph[visited[visited.length-1]][i] >= 0) {
			const r = findBest(graph, visited.concat([i]), distance + graph[visited[visited.length-1]][i]);
			if (r !== null && (bestDistance === null || r.distance < bestDistance)) {
				bestDistance = r.distance;
				best = r.route;
				if (visited.length < 3)
					postMessage({candidate: best, distance: bestDistance});
			}
		}
		if (visited.length === 1)
			postMessage({progress: Math.floor(i*100/graph.length)});
	}
	if (visited.length === 1)
		postMessage({progress: 100});
	if (bestDistance !== null)
		return {route: best, distance: bestDistance};
	else
		return null;
}

onmessage = (message) => {
	if (message.data.hasOwnProperty("command") && message.data.command === "find") {
		const graph = message.data.graph;
		postMessage("working");
		let startNode = 0;
		while (startNode < graph.length) {
			const best = findBest(graph, [startNode], 0);
			if (best != null) {
				postMessage(best);
				return;
			}
			startNode++;
		}
		postMessage({route: null, distance: null});
	}
}