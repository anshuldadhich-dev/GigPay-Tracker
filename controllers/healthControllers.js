const checkHealth = (req, res) => {
	res.json({
	success : true, 
	message : "GigPay Tracker Api is healthy"
	});
};

module.exports = {
checkHealth
};