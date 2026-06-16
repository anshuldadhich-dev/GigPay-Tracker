const startTime = Date.now();

const checkHealth = (req, res) => {
	res.json({
		success: true,
		message: "GigPay Tracker Api is healthy",
		timestamp: new Date().toISOString(),
		uptime: Math.floor((Date.now() - startTime) / 1000),
	});
};

module.exports = {
	checkHealth,
};