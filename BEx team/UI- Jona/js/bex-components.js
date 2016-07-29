$(document).ready(function(){
// drop down
	$('.drop').each(function(){
		var dropStructure = '<span class="button"><span class="selected_option"></span><i class="drop-trigger ion-chevron-down"></i></span><div class="list-container"><span class="tip"></span><ul></ul></div>';
		var $drop = $(this);
		$drop.prepend(dropStructure);

		// take first value of the select
		var setFirstOption = $drop.find('select.bex-assets > option:first-child()').text();
		$drop.find('.selected_option').text(setFirstOption);
		// clone the option in a new list
		$drop.find('select.bex-assets option').each(function(){
			var textoOption = $(this).text();
			$drop.find('.list-container ul').append('<li>' + textoOption + '</li>');
		});
	});

// show the list with arrow
	$('.drop-trigger').on('click', function(){
		var dropMaster = $(this).parents('.drop');
		dropMaster.find('.list-container').toggle();
	});
// on selection, change display, close list and add the selection on select
	$('.list-container li').on('click', function(){
		var selected = $(this).text(); // get text inside the li
		var dropMaster = $(this).parents('.drop');
		var childrenOrder = $(this).index() + 1;

		dropMaster.find('.selected_option').text(selected); // change the text
		dropMaster.find('.list-container').toggle(); // hide the list
		dropMaster.find('select option').attr("selected",false); // remove attr selected on every option
		dropMaster.find('select option:nth-child(' + childrenOrder + ')').attr("selected",true); // add attr selected
	});
// tabs
	$('.tabs li').on('click', function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
// error
	var errorMessage = 'Error message displayed here';
	$('.form-control.error').after('<span class="text-error">' + errorMessage + '</span>');
// search 	
	var searchStructureFront = '<div class="search-field-content">';
	var searchStructureBack = '<span class="icon-search"></span></div>';
	var originalContent = $('input.search-field').parents('.form-group').html();
	$('input.search-field').parents('.form-group').html(searchStructureFront + originalContent + searchStructureBack);
// tooltip
	$('.info-asset .icon-info').each(function(){
		var dataLabel = $(this).attr('data-label');		
		var dataInfo = $(this).attr('data-info');
		$(this).before('<p class="inline tooltip-label">' + dataLabel + '</p>');
		//console.log(dataInfo);
	});	
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
			$(dummyRadio).toggleClass('icon-radio-button icon-radio-button-selected');
			if($(dummyRadio).siblings('input[type=radio]').prop('checked')){
				$(this).prop('checked', false);
			} else {
				$(this).prop('checked', true);
			}
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
			$(dummyCheck).toggleClass('icon-uncheck-mark icon-check-mark');
			if($(dummycheck).siblings('input[type=checkbox]').prop('checked')){
				$(this).prop('checked', false);
			} else {
				$(this).prop('checked', true);
			}
		});
	});
// positive and negative numbers
	$('.negative-asset, .negative-asset-alt').each(function(){
		var tipDown = '<i class="icon-triangle-down"></i>';
		$(this).append(tipDown);
	});	
	$('.positive-asset, .positive-asset-alt').each(function(){
		var tipUp = '<i class="icon-triangle-up"></i>';
		$(this).append(tipUp);
	});	

		

});