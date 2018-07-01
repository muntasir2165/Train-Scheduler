// Initialize Firebase
var config = {
    apiKey: "AIzaSyDQXloNcsYmXy_-fJuNLKIXznPp-UzORVM",
    authDomain: "testproject-e35d0.firebaseapp.com",
    databaseURL: "https://testproject-e35d0.firebaseio.com",
    projectId: "testproject-e35d0",
    storageBucket: "testproject-e35d0.appspot.com",
    messagingSenderId: "176664412317"
  };

firebase.initializeApp(config);
// Create a variable to reference the database.
var database = firebase.database();

$(document).ready(function() {
	addEmployeeFormSubmissionEventListener();
});

function addEmployeeFormSubmissionEventListener() {
	$("#submit-employee-info").on("click", function(event) {
    	event.preventDefault();
    	// console.log("inside addEmployeeFormSubmissionEventListener()");
    	var employee = {};
    	employee.employeeName = $("#name").val().trim();
    	$("#name").val("");
    	employee.role = $("#role").val().trim();
    	$("#role").val("");
    	employee.startDate = $("#start-date").val().trim();
    	$("#start-date").val("");
    	employee.monthlyRate = parseInt($("#monthly-rate").val().trim());
    	$("#monthly-rate").val("");
    	displayEmployeeInfo(employee);
	});
}

function displayEmployeeInfo(employee) {
	
	addEmployeeInfoToDatabase(employee);

	var tableBody = $("#employee-table-body");
	var tableRow = $("<tr>");
	
	var employeeNameTableCell = $("<td>");
	employeeNameTableCell.text(employee.employeeName)
	tableRow.append(employeeNameTableCell);
	
	var roleTableCell = $("<td>");
	roleTableCell.text(employee.role)
	tableRow.append(roleTableCell);

	var startDateTableCell = $("<td>");
	startDateTableCell.text(employee.startDate)
	tableRow.append(startDateTableCell);

	var monthsWorkedTableCell = $("<td>");
	monthsWorkedTableCell.text(moment().diff(moment(employee.startDate, "MM/DD/YYYY"), "months"));
	tableRow.append(monthsWorkedTableCell);

	var monthlyRateTableCell = $("<td>");
	monthlyRateTableCell.text(employee.monthlyRate)
	tableRow.append(monthlyRateTableCell);

	var totalBilledTableCell = $("<td>");
	totalBilledTableCell.text(parseInt(moment().diff(moment(employee.startDate, "MM/DD/YYYY"), "months")) * employee.monthlyRate);
	tableRow.append(totalBilledTableCell);

	tableBody.append(tableRow);
}

function addEmployeeInfoToDatabase(employee) {
    database.ref().push({
        name: employee.employeeName,
        role: employee.role,
        startDate: employee.startDate,
        monthlyRate: employee.monthlyRate,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
}


