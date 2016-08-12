$(document).ready(function(){
// drop down
	$('div.select-asset').each(function(){
		assetStructure = '<span class="selected_option">holis</span><i class="icon-chevron-down"></i><div class="select-asset-list-container"><i class="icon-triangle-up"></i><ul class="select-asset-list"></ul></div>';
		assetSelect = $(this);
		assetSelect.prepend(assetStructure);

		// take first value of the select
		var setFirstOption = assetSelect.find('select.select-asset > option:first-child()').text();
		//console.log(setFirstOption);
		$('.selected_option', this).text(setFirstOption);
	
		// clone the options in a new list		
		assetSelect.find('select.select-asset > option').each(function(){
			var textoOption = $(this).text();
			//console.log(textoOption);
			assetSelect.find('.select-asset-list').append('<li>' + textoOption + '</li>');			
		});
	}); 

	// show the list with arrow
	$('.icon-chevron-down').on('click', function(){
		$(this).siblings('.select-asset-list-container').toggle();		
	});

	// on selection, change display, close list and add the selection on select
	$('.select-asset-list li').on('click', function(){
		var selected = $(this).text(); // get text inside the li
		var assetSelect = $(this).parents('div.select-asset');
		var childrenOrder = $(this).index() + 1;

		assetSelect.find('.selected_option').text(selected); // change the text
		assetSelect.find('select option').attr("selected",false); // remove attr selected on every option
		assetSelect.find('select option:nth-child(' + childrenOrder + ')').attr("selected",true); // add attr selected
		assetSelect.find('.select-asset-list-container').toggle(); // hide the list
		
	});
// tabs
	$('.tabs li, .tabs-small li').on('click', function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
// error
	var errorMessage = 'Error message displayed here';
	$('.form-control.error').after('<span class="text-error">' + errorMessage + '</span>');
	$('.form-control.error').keypress(function(){
		$(this).removeClass('error');
		$(this).next('span').remove();
	});
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
// positive and negative numbers
	$('.negative-asset, .negative-asset-alt').each(function(){
		var tipDown = '<i class="icon-triangle-down"></i>';
		$(this).append(tipDown);
	});	
	$('.positive-asset, .positive-asset-alt').each(function(){
		var tipUp = '<i class="icon-triangle-up"></i>';
		$(this).append(tipUp);
	});

// Navbar submenu 
	$('.blue-menu-top-button a').on('click', function(){
		$(this).siblings('.blue-menu-top-container').toggle();
		$('span.tip', this).toggle();
	});

// close button for type 3 table
	$('.close-button').on('click', function(){
		$(this).parents('#type3-parent').hide();
	});

// DUMMY FUNCTIONS > All this behavior must be generated after retreaving the data, this is just an example of interaction
	$('.head-tab-container .head-tab').on('click', function(){
		$('.head-tab-container .head-tab').removeClass('active');
		$(this).addClass('active');
		var target = $(this).index() + 1;
		$('.tab-container .tab-content').removeClass("active-tab");
		$('.tab-container .tab-content:nth-child(' + target +')').addClass("active-tab");
	});
	
	var sqlp;
	var ls1;
	$('.panel-type1 table.asset tbody tr td:first-child a').on('click', function(event){
		event.preventDefault();
		$('#type3-parent').hide(1);
		$('.panel-type2 table.asset tbody tr').removeClass('active');
		sqlp = $(this).text();
		$('.panel-type1 table.asset tbody tr').removeClass('active');
		$(this).parents('tr').addClass('active');
		$('.panel-type2 > .panel-heading > .panel-title > span.lp-selected').text(sqlp);
	});
	$('.panel-type2 table.asset tbody tr td:first-child a').on('click', function(event){
		event.preventDefault();
		ls1 = $(this).text();
		
		$('.panel-type2 table.asset tbody tr').removeClass('active');
		$(this).parents('tr').addClass('active');
		$('#type3-parent').show(1);
		$('.panel-type3 > .panel-heading > .panel-title > span.lp-selected').text(sqlp);
		$('.panel-type3 > .panel-heading > .panel-title > span.pair-selected').text(ls1);
	});

	var levelOp = $('#level .selected_option').text();
	var getLEvel = levelOp.substring(0,2);
	$('#pair-level').text(getLEvel);

	$('#level .select-asset-list li').on('click', function(){
		var opClicked = $(this).text().substring(0,2);
		$('#pair-level').text(opClicked);		
	});

});