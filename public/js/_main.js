// Doc Ready
$(function () {
    
    /**
     * Fix typeof
     */
    var toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    
    /**
     * Notifier
     */
    var notifier = new Backbone.Notifier({
        closeBtn: true
    });
    
    
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
            var checkSpecialsMsg = notifier.notify({
                'type': 'warning',
                message: 'Checking for specials...',
                destroy: true,
                loader: true,
                ms: null
            });
            var getDataLoop = setInterval(function() { 
                if(toType(venue.venueData.get('venue')) == 'undefined') {
                    venue.getItems(true);
                } else {
                    checkSpecialsMsg.destroy()
                    clearInterval(getDataLoop);
                }
            }, 2000);
            
            clearInterval(check);
            // Start the footer ad timing
            var footer = new FooterView({ el: $('#footer'), user: $.parseJSON(localStorage.getItem('k0skUser')) });
            
            // Ads modal
            var adsModal = new AdsView({ el: $('#ad-block'), user: $.parseJSON(localStorage.getItem('k0skUser')) });
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
    
    // Sticky footer ad
    var bodyHeight = $("body").height();
	var vwptHeight = $(window).height();
	if (vwptHeight > bodyHeight) {
		$("#footer").css("position","fixed").css("bottom","-200px");
	}
	
	
	// Resize the window height;
	$(window).resize(function() {
		$('#main').height($(window).height());
	});
	$(window).trigger('resize');
	
	
	/**
	 * Page Reloads
	 */
	
	// Full page reload
	setInterval(function() {
		location.reload();
	}, 28800000);
	
	// Reload the page on fullscreen change
    $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
        var isFullScreen = document.fullScreen || 
                            document.mozFullScreen || 
                            document.webkitIsFullScreen;
        if(!isFullScreen){
            location.reload();
        }
    });
    
    // Reload on venue logo click
    $('#venue-logo').click(function() {
       location.reload(); 
    });

    
});

// Window Ready
$(window).ready(function() {
    
});