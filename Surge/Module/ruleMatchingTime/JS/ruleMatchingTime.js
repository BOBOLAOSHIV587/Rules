let initial = {
	numberOfRequests: 0,
	totalMatchingTime: 0,
	latestRecordTime: 0,
};
let history = JSON.parse(
	$persistentStore.read("RULEMATCHINGTIME") || JSON.stringify(initial)
);

$httpAPI("GET", "/v1/requests/recent", null, (body) => {
	body.requests.forEach((request) => {
		if (
			request.timingRecords &&
			request.setupCompletedDate > history.latestRecordTime &&
			request.timingRecords[0].name == "Rule Evaluating"
		) {
			history.totalMatchingTime += request.timingRecords[0].duration;
			history.numberOfRequests += 1;
		}
	});

		history.latestRecordTime = body.requests[0].setupCompletedDate;
	$persistentStore.write(JSON.stringify(history), "RULEMATCHINGTIME");

	let avgMatchingTime = (
		(history.totalMatchingTime * 1000) /
		history.numberOfRequests
	).toFixed(2);
	$done({
		title: "Rule Matching Time",
		content: `统计数量: ${history.numberOfRequests}\n平均时间: ${avgMatchingTime} ms`,
		icon: "bolt.horizontal.circle.fill",
	});
});
