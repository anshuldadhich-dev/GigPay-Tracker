const rides = [];
const addRide = (req , res) => {
	
	const {pickup, drop, fare} = req.body;

//validation
if(!pickup || !drop || !fare) {
	return res.status(400).json({
		success : false,
		message : "Pickup , drop and fare are required"
		});	
	}

const rideData = {
	id: rides.length + 1,
	pickup,
	drop,
	fare
};

//save ride
rides.push(rideData);

res.status(201).json({
	success : true, 
	message : "Ride added successfully",
	data : rideData
	});
};
//all rides
const getAllRides = (req , res) => {
	
	res.status(200).json({
		success : true,
		totalRides : rides.length,
		data : rides
	});
};


//getting rides by id
const getRidesById = (req, res) => {
	const rideid = parseInt(req.params.id);
	const ride = rides.find(r => r.id === rideId);

if(!ride) {
return res.status(404).json({
success: false ,
message : "Ride not found"
});
}

res.status(200).json({
success : true,
data: ride
});

};
//updation
const updateRide = (req , res) => {
	const rideId = parseInt(req.params.id);
	
	const {pickup , drop, fare} = req.body;

	const ride = rides.find(r => r.id === rideId);

	if(!ride){
		return res.status(404).json({
		success : false, 
		message : "Ride not found"
});
}

if(pickup) ride.pickup = pickup;
if(drop) ride.drop = drop;
if(fare) ride.fare = fare;

res.status(200).json({
	success : true,
	message : "Ride updated successfully",
	data : ride
});

};

//Deletion
const deleteRide = (req , res) => {
	const rideId = parseInt(req.params.id);
	
	const rideIndex = rides.findIndex(r => r.id === rideId);

	if(rideIndex === -1){
	return res.status(404).json({
		success: false, 
		message: "Ride not found"
	});
	}

	rides.splice(rideIndex , 1);
	
	res.status(200).json({
	success : true,
	message : "Ride deleted successfully"
	});
};

module.exports = {
addRide,
getAllRides,
getRidesById,
updateRide,
deleteRide
};