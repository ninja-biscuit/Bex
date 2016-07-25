$(document).ready(function(){
	// Dummy validation
			
	$('#submit').on('click', function(){
		$('#error-email, #error-pass').empty();
		var inputMail = $('#inputEmail').val();
		var inputPass = $('#inputPass').val();
		
		var theMail = "user";
		var thePass = "user*pass123";
		var validMail;
		var validPass;
		
		if(inputMail != theMail){
			//mailError = "Invalid email address";
			$('#error-email').fadeIn(200).html("Invalid email address");

		} else {
			validMail = true;
		}
		if(inputPass != thePass){
			//passError = "Incorrect password";
			$('#error-pass').fadeIn(200).html("Incorrect password");
		} else {
			validPass = true;
		}

		if(validMail && validPass === true){
			alert("Welcome user");
		}
		
	});



});