// Doc Ready
$(function () {
    
    // Show login if not logged in
    if(typeof $.cookie('k0skKey') == 'undefined' || $.cookie('k0skKey') == 'null') {
        var user = new UserView({ el: $('#login-block') });
        $('#login-block').modal({
            keyboard: false, 
            backdrop: 'static'
        });
    }
    
    
    // Settings block
    var settings = new SettingsView({ el: $('#settings-block') });
    // Render the settings at least once on page load
    settings.render();
    
    
    // Check for login and get some data
    var venue = new VenueView({ el: $('.flexslider') });
	
    var check = setInterval(function() {
        if(typeof $.cookie('k0skKey') != 'undefined' && $.cookie('k0skKey') != 'null'){
            venue.setVenue();
            venue.setUser($.parseJSON(localStorage.getItem('k0skUser')));
            venue.getItems();
            clearInterval(check);
        }
    }, 3000);
    
    
    /**
     * Listeners & DOM ready actions
     */
    
    // Fix text sizes using fitText
    $('#page-headline h1').fitText(1.2);
    
    // Catch the logo click
    $('#ts-logo').click(function() {
        $('#settings-block').modal({
            keyboard: false
        });
    });
    
    // Catch the esc key
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { location.reload() }   // esc
    });
    
    // Reload the page on fullscreen change
    $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
		var isFullScreen = document.fullScreen || 
							document.mozFullScreen || 
							document.webkitIsFullScreen;
		if(!isFullScreen){
			location.reload();
		}
	});
    
    
    // Sticky footer
    var bodyHeight = $("body").height();
  	var vwptHeight = $(window).height();
  	if (vwptHeight > bodyHeight) {
    	$("#footer").css("position","fixed").css("bottom",0);
  	}
  	
  	// Resize the window height;
  	$(window).resize(function() {
        $('#main').height($(window).height());
    });
    
    $(window).trigger('resize');
  	
  	setInterval(function() {
  	    location.reload();
  	}, 28800000);
    
});

// Window Ready
$(window).ready(function() {
    
});