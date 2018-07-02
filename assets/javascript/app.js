
var database = null;
var trainInfoArray = [];

$(document).ready(function() {
	// a variable to reference the database.
	database = initializeFirebase();
	getTrainInfoFromDatabase();
	addTrainFormSubmissionEventListener();
	displayTrainInfoTable();
});

function initializeFirebase() {
	var config = {
		apiKey: "AIzaSyAGPLldtbicJ5SYT51F5EsLEOUIM3urSQQ",
		authDomain: "train-scheduler-4e814.firebaseapp.com",
		databaseURL: "https://train-scheduler-4e814.firebaseio.com",
		projectId: "train-scheduler-4e814",
		storageBucket: "train-scheduler-4e814.appspot.com",
		messagingSenderId: "931838532405"
	};
	firebase.initializeApp(config);
	return firebase.database();
}

function addTrainFormSubmissionEventListener() {
	$("#submit-train-info").on("click", function(event) {
		event.preventDefault();

		var train = {};
		train.trainName = $("#train-name").val().trim();
		train.destination = $("#destination").val().trim();
		train.firstTrainTime = $("#first-train-time").val().trim();
		train.frequency = parseInt($("#frequency").val().trim());

		clearTrainForm();
		addTrainInfoToDatabase(train);
		// displayTrainInfo(train);
	});
}

function clearTrainForm() {
	$("#train-name").val("");
	$("#destination").val("");
	$("#first-train-time").val("");
	$("#frequency").val("");
}

function displayTrainInfoTable() {
	var tableBody = $("#train-table-body");
	tableBody.empty();
	trainInfoArray.forEach(function(train){
		tableBody.append(generateTrainHtml(train));
	});
}

function generateTrainHtml(train) {
	var tableRow = $("<tr>");
	
	var trainNameTableCell = $("<td>");
	trainNameTableCell.text(train.trainName)
	tableRow.append(trainNameTableCell);
	
	var destinationTableCell = $("<td>");
	destinationTableCell.text(train.destination)
	tableRow.append(destinationTableCell);

	var frequencyTableCell = $("<td>");
	frequencyTableCell.text(train.frequency)
	tableRow.append(frequencyTableCell);

	var nextTrainMinutesAway = getNextTrainMinutesAway(train.firstTrainTime, train.frequency);
	var nextArrivalTableCell = $("<td>");
	nextArrivalTableCell.text(getNextTrainArrivalTime(nextTrainMinutesAway));
	// monthsWorkedTableCell.text(moment().diff(moment(employee.startDate, "MM/DD/YYYY"), "months"));
	tableRow.append(nextArrivalTableCell);

	var minutesAwayTableCell = $("<td>");
	minutesAwayTableCell.text(nextTrainMinutesAway);
	tableRow.append(minutesAwayTableCell);

	return tableRow;
}

function getNextTrainArrivalTime(nextTrainMinutesAway) {
	var nextTrainArrivalTime = moment().add(parseInt(nextTrainMinutesAway), 'minutes').format('hh:mm A');
	return nextTrainArrivalTime;
}

function getNextTrainMinutesAway(firstTrainTime, frequency) {
	var firstTrainInMinutes = moment(firstTrainTime, "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
	var currentTimeInMinutes = moment(moment().format("HH:mm"), "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
	var nextTrainMinutesAway = (parseInt(frequency) - ( (parseInt(currentTimeInMinutes) - parseInt(firstTrainTime)) % parseInt(frequency) ));
	return nextTrainMinutesAway;
}

function addTrainInfoToDatabase(train) {
	trainInfoArray.push(train);
	database.ref().push({
		trainInfoArray: trainInfoArray
	});
}

function getTrainInfoFromDatabase() {
	database.ref().on("value", function(snapshot) {
		// We are now inside our .on function...

		// Console.log the "snapshot" value (a point-in-time representation of the database)
		// console.log(snapshot.val());
		console.log(snapshot.val()[Object.keys(snapshot.val())[0]].trainInfoArray);
		
		// This "snapshot" allows the page to get the most current values in firebase.

		// Change the value of our trainInfoArray to match the value in the database
		if (snapshot.val()) {
			trainInfoArray = snapshot.val()[Object.keys(snapshot.val())[0]].trainInfoArray;
		}

		// Change the HTML using jQuery to reflect the updated train schedule table
		displayTrainInfoTable();

	// If any errors are experienced, log them to console.
	}, function(errorObject) {
	  console.log("The read failed: " + errorObject);
	});
}


