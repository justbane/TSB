/**
 * Fix typeof
 */
var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

// Window Ready
$(window).ready(function() {
    var appCache = window.applicationCache;
    appCache.addEventListener('updateready', function(e) {
        if (appCache.status == appCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Get the old setings of they exist.
            var prevSettings = $.parseJSON(localStorage.getItem('k0skSettings'));
            // Loop them into a new settings object to persist valid settings and 
            // cover legacy settings that might change or deprecate.
            var initSettings = new Settings();
            for(x in prevSettings) {
                if(toType(initSettings.defaults[x]) == "undefined") {
                    initSettings.defaults[x] = prevSettings[x];
                }
                if(initSettings.defaults[x] != prevSettings[x]) {
                    initSettings.defaults[x] = prevSettings[x];
                }
            }
            // Set the settings object and reload
            localStorage.setItem('k0skSettings', JSON.stringify(initSettings.defaults));
            window.location.reload();
        }
  }, false);
});

// Doc Ready
$(function () {
    
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
    $('.selectpicker').selectpicker({
        size: 5
    });
    
    
    // Check for login and get some data
    var venue = new VenueView({ el: $('.flexslider'), settings: $.parseJSON(localStorage.getItem('k0skSettings')) });
	
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
                    checkSpecialsMsg.destroy();
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
        if (e.keyCode == 27) { location.reload(); }   // esc
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
	
	// Full page reloader
	var reloader = new ReloaderView({ user: $.parseJSON(localStorage.getItem('k0skUser')) });
	
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