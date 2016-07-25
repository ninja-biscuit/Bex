$(document).ready(function(){
	// Dummy validation
	console.log("HELLOOOO");
		
	$('#submit').on('click', function(){
		var inputMail = $('#inputEmail').val();
		var inputPass = $('#inputPass').val();
		console.log(inputMail + ", ");
		console.log(inputPass + "");
		var theMail = "user";
		var thePass = "user*pass123";
		console.log("usuario: " + theMail + " | ");
		console.log("contraseña: " + thePass + ".");
		/*
		if(!inputMail == uniqueMail){
			//mailError = "Invalid email address";
			$('#error-pass').html("Invalid email address");
		}
		if(!inputPass == uniquePass){
			//passError = "Incorrect password";
			$('#error-email').html("Incorrect password");
		} 
		*/
	});



});