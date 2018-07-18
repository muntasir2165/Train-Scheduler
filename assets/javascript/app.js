
var database = null;
var trainInfoArray = [];

$(document).ready(function() {
	// a variable to reference the database.
	database = initializeFirebase();
	getTrainInfoFromDatabase();
	cancelTrainUpdateFormSubmissionEventListener();
	addTrainFormSubmissionEventListener();
	displayTrainInfoTable();
	clearTrainForm();
	updateTrainInfoPencilSquareIconClickListener();
	deleteTrainInfoTrashIconClickListener();
	updateTableInfoEveryMinute();
	// seedData();
});

function updateTableInfoEveryMinute() {
	setInterval(function () {
		console.log("updating train into table at: " + moment().format("HH:mm:ss A"));
    	displayTrainInfoTable();
	}, 60 * 1000);
}

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

function deleteTrainInfoTrashIconClickListener() {
    $(document).on("click", "i.fa-trash", function() {
    	var databaseKey = $(this).attr("data-key");
		database.ref().child(databaseKey).remove();
	});
}

function updateTrainInfoPencilSquareIconClickListener() {
    $(document).on("click", "i.fa-pencil-square-o", function() {
    	var databaseKey = $(this).attr("data-key");
    	var trainToUpdate = getTrain(databaseKey);
		modifyFormForUpdatetrainInfo(trainToUpdate);
	});
}

function getTrain(databaseKey) {
	for (var i=0; i<trainInfoArray.length; i++) {
		var currentTrain = trainInfoArray[i];
		if (currentTrain.databaseKey === databaseKey) {
			return currentTrain;
		}
	}
}

function modifyFormForUpdatetrainInfo(trainToUpdate) {
	$("#train-add-update").text("Update Train");

	$("#train-name").val(trainToUpdate.trainName);
	$("#destination").val(trainToUpdate.destination);
	$("#first-train-time").val(trainToUpdate.firstTrainTime);
	$("#frequency").val(trainToUpdate.frequency);
	$("#databaseKey").val(trainToUpdate.databaseKey);

	$("#cancel-train-info-update").show();
}

function cancelTrainUpdateFormSubmissionEventListener() {
	$("#cancel-train-info-update").on("click", function(event) {
		event.preventDefault();
		clearTrainForm();
	});
}

function addTrainFormSubmissionEventListener() {
	$("#submit-train-info").on("click", function(event) {
		event.preventDefault();

		var train = {};
		train.trainName = $("#train-name").val().trim();
		train.destination = $("#destination").val().trim();
		train.firstTrainTime = $("#first-train-time").val().trim();
		train.frequency = $("#frequency").val().trim();
		
		var databaseKey = $("#databaseKey").val().trim();

		var isTrainNameNonEmptyAndUnique = true;
		var isDestinationNonEmpty = true;
		var isFirstTrainTimeValid = true;
		var isFrequencyValid = true;

		if (!uniqueNonEmptyTrainName(databaseKey, train.trainName) || !validNonEmptyDestination(train.destination) || !validFirstTrainTime(train.firstTrainTime) || !validFrequency(train.frequency)) {
			if (!uniqueNonEmptyTrainName(databaseKey, train.trainName)) {
				isTrainNameNonEmptyAndUnique = false;
			}
			if (!validNonEmptyDestination(train.destination)) {
				isDestinationNonEmpty = false;
			}
			if (!validFirstTrainTime(train.firstTrainTime)) {
				isFirstTrainTimeValid = false;
			}		
			if (!validFrequency(train.frequency)) {
				isFrequencyValid = false;
			}
			showFormInputFeedback(false, isTrainNameNonEmptyAndUnique, isDestinationNonEmpty, isFirstTrainTimeValid, isFrequencyValid);
		} else {	
			clearTrainForm();
			if (databaseKey) {
				// if databaseKey is NOT null then we are updating an existing train's info
				updateTrainInfoToDatabase(databaseKey, train);
			} else {
				addTrainInfoToDatabase(train);
			}
		}
	});
}

function uniqueNonEmptyTrainName(databaseKey, trainName) {
	if (!trainName) {
		return false;
	}
	for (var i=0; i< trainInfoArray.length; i++) {
		if (trainName === trainInfoArray[i].trainName) {
			// if the train name exists and databaseKey is NOT null (i.e., we are updating an existing train's information)
			// then return true to indicate that the train name is unique
			if (databaseKey) {
				return true;
			}
			return false;
		}
	}
	return true;
}

function validNonEmptyDestination(destination) {
	return !(destination === "");
}

function validFirstTrainTime(firstTrainTime) {
	return moment(firstTrainTime, 'HH:mm', true).isValid();
}

function validFrequency(frequency) {
	var pattern = /^\d+$/;
	return pattern.test(frequency);
}

function showFormInputFeedback(hideFormInputFeedback, isTrainNameNonEmptyAndUnique, isDestinationNonEmpty, isFirstTrainTimeValid, isFrequencyValid) {
	var trainNameFeedbackContainer = $("#train-name-feedback");
	var trainDestinationFeedbackContainer = $("#train-destination-feedback");
	var firstTrainTimeFeedbackContainer = $("#first-train-time-feedback");
	var frequencyFeedbackContainer = $("#frequency-feedback");

	if (hideFormInputFeedback) {
		trainNameFeedbackContainer.text("");
		trainDestinationFeedbackContainer.text("");
		firstTrainTimeFeedbackContainer.text("");
		frequencyFeedbackContainer.text("");
		return;
	}

	if (!isTrainNameNonEmptyAndUnique) {
		trainNameFeedbackContainer.text("Please input a non-empty unique train name that is not already listed in the table above");
	} else {
		trainNameFeedbackContainer.text("");
	}

	if (!isDestinationNonEmpty) {
		trainDestinationFeedbackContainer.text("Please input a non-empty train destination");
	} else {
		trainDestinationFeedbackContainer.text("");
	}

	if (!isFirstTrainTimeValid) {
		firstTrainTimeFeedbackContainer.text("Please enter a valid military time in the exact format HH:mm");
	} else {
		firstTrainTimeFeedbackContainer.text("");
	}

	if (!isFrequencyValid) {
		frequencyFeedbackContainer.text("Please only input numbers");
	} else {
		frequencyFeedbackContainer.text("");
	}
}

function clearTrainForm() {
	$("#train-add-update").text("Add Train");

	$("#train-name").val("");
	$("#destination").val("");
	$("#first-train-time").val("");
	$("#frequency").val("");
	$("#databaseKey").val("");
	showFormInputFeedback(true);

	$("#cancel-train-info-update").hide();
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
	trainNameTableCell.text(train.trainName);
	tableRow.append(trainNameTableCell);
	
	var destinationTableCell = $("<td>");
	destinationTableCell.text(train.destination);
	tableRow.append(destinationTableCell);

	var frequencyTableCell = $("<td>");
	frequencyTableCell.text(train.frequency);
	tableRow.append(frequencyTableCell);

	var nextTrainMinutesAway = getNextTrainMinutesAway(train.firstTrainTime, train.frequency);
	var nextArrivalTableCell = $("<td>");
	nextArrivalTableCell.text(getNextTrainArrivalTime(nextTrainMinutesAway));
	// monthsWorkedTableCell.text(moment().diff(moment(employee.startDate, "MM/DD/YYYY"), "months"));
	tableRow.append(nextArrivalTableCell);

	var minutesAwayTableCell = $("<td>");
	if (parseInt(nextTrainMinutesAway) === 0) {
		minutesAwayTableCell.addClass("train-now");
		minutesAwayTableCell.text("now!");
	}else {
		minutesAwayTableCell.removeClass("train-now");
		minutesAwayTableCell.text(nextTrainMinutesAway);
	}
	tableRow.append(minutesAwayTableCell);

	var updateTrainInfoTableCell = $("<td>");
	updateTrainInfoTableCell.html("<i data-key=\""+ train.databaseKey + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>");
	tableRow.append(updateTrainInfoTableCell);

	var deleteTrainInfoTableCell = $("<td>");
	deleteTrainInfoTableCell.html("<i data-key=\""+ train.databaseKey + "\" class=\"fa fa-trash fa-2x\" aria-hidden=\"true\"></i>");
	tableRow.append(deleteTrainInfoTableCell);

	return tableRow;
}

function getNextTrainArrivalTime(nextTrainMinutesAway) {
	var nextTrainArrivalTime = moment().add(parseInt(nextTrainMinutesAway), 'minutes').format('hh:mm A');
	return nextTrainArrivalTime;
}

function getNextTrainMinutesAway(firstTrainTime, frequency) {
	var firstTrainInMinutes = moment(firstTrainTime, "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
	var currentTimeInMinutes = moment(moment().format("HH:mm"), "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
	var nextTrainMinutesAway = ( currentTimeInMinutes - firstTrainInMinutes) % parseInt(frequency);
	// console.log(firstTrainInMinutes, currentTimeInMinutes, nextTrainMinutesAway);
	if (nextTrainMinutesAway > 0 && nextTrainMinutesAway < parseInt(frequency)) {
		nextTrainMinutesAway = parseInt(frequency) - nextTrainMinutesAway;
	} else if (nextTrainMinutesAway < 0) {
		nextTrainMinutesAway = Math.abs(nextTrainMinutesAway);
	}
	return nextTrainMinutesAway;
}

function updateTrainInfoToDatabase(databaseKey, train) {
	database.ref().child(databaseKey + "/train").update(train);
}

function addTrainInfoToDatabase(train) {
	database.ref().push({
		train: train
	});
}

function getTrainInfoFromDatabase() {
	database.ref().on("value", function(snapshot) {
		// We are now inside our .on function...

		// Console.log the "snapshot" value (a point-in-time representation of the database)
		// console.log("snapshot.val(): " + snapshot.val());

		// This "snapshot" allows the page to get the most current values in firebase.

		// Update the value of our trainInfoArray to match the info in the database
		trainInfoArray = [];
		if (snapshot.val()) {			
			Object.keys(snapshot.val()).forEach(function(key){
				// console.log(snapshot.val()[key].train);
				var train = snapshot.val()[key].train;
				train.databaseKey = key;
				trainInfoArray.push(train);
			});
		}

		// Change the HTML using jQuery to reflect the updated train schedule table
		displayTrainInfoTable();
		console.log("trainInfoArray length: " + trainInfoArray.length);

	// If any errors are experienced, log them to console.
	}, function(errorObject) {
	  console.log("The read failed: " + errorObject);
	});
}

function seedData() {
	addTrainInfoToDatabase({"destination":"North Pole","firstTrainTime":"23:30","frequency":"30","trainName":"Polar Express"});
	addTrainInfoToDatabase({"destination":"Hogwarts School of Wizardry","firstTrainTime":"04:15","frequency":"60","trainName":"Hogwarts Express"});
	addTrainInfoToDatabase({"destination":"Wakanda City Centre","firstTrainTime":"15:00","frequency":"15","trainName":"Wakanda Shuttle"});
}


