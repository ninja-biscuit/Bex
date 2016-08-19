$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
	// tabs
	$('.tabs li, .tabs-small li').on('click', function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
	// tablas
		$('.panel-body > table').each(function(){
			var colAmount = $('tbody > tr:first-child > td', this).length;
			$('tbody > tr > td', this).css('width', 100/colAmount + '%');
			$('thead > tr > td', this).css('width', 100/colAmount + '%');
		});	
	// progress bar
	$('.progress-bar-container').each(function(){
		var setProgress = $(this).data('progress');
		$('.progress-bar', this).css('width', setProgress + "%");
	});
	// stats assets
	$('.positive-digit').append('<i class="icon-arrowup"></i>');
	$('.negative-digit').append('<i class="icon-arrowdown"></i>');

	// radio buttons
	$('.radio-asset').each(function(){
		var thisAsset = $(this);
		if($('input', this).is(':checked')){
			$(this).prepend("<span class='icon-radio-button-selected'></span>");
		} else {
			$(this).prepend("<span class='icon-radio-button'></span>");
		}
		
		$(thisAsset).on('click', function(){
			var dummyRadio = $('span', this);
			var trueCheck = $('input[type="radio"]', this);
			$(dummyRadio).toggleClass('icon-radio-button icon-radio-button-selected');
			trueCheck.attr("checked", !trueCheck.attr("checked"));
		});
	});
// checkboxes
	$('.check-asset').each(function(){
		var thisAsset = $(this);
		if($('input', this).is(':checked')){
			$(this).prepend("<span class='icon-check-mark'></span>");
		} else {
			$(this).prepend("<span class='icon-uncheck-mark'></span>");
		}
		
		$(thisAsset).on('click', function(){
			var dummyCheck = $('span', this);
			var trueCheck = $('input[type="checkbox"]', this);
			$(dummyCheck).toggleClass('icon-uncheck-mark icon-check-mark');	
			trueCheck.attr("checked", !trueCheck.attr("checked"));			
		});
	});

});