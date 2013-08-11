$(function() {
    
    
    // Store Venue Data ----------------- */
    Venue = Backbone.Model.extend({
        urlRoot: '/kosk',
        defaults: {
            vid: '',
            key: '',
            username: ''
        },
        
        validate: function(attrs, options) {
            if(!attrs.vid) {
                return "Error: no id found";
            }
            if(!attrs.key) {
                return "Error: no key found";
            }
            if(!attrs.username) {
                return "Error: no username found";
            }
        }
    });
   
    Venues = Backbone.Collection.extend({
        
        model: Venue
    
    });
    
    
    // Settings Defaults ----------------- */
    Settings = Backbone.Model.extend({
    
        defaults: {
            slideAnimation: 'slide',
            animationTimeout: 3000,
            headerText: "Today's Specials",
            headerColor: "#ffffff",
            headerFont: "chalk",
            specialTitleFont: "chalk",
            specialTitleColor: "#ffffff",
            specialSubTitleFont: "chalk",
            specialSubTitleColor: "#ffffff",
            specialBodyFont: "arial",
            specialBodyColor: "#ffffff"
        }
    
    });
    
    Fonts = Settings.extend({
		defaults: {
			availablefonts: {
				chalk: "chalk",
				arial: "arial",
				indie: "indie-flower"
			}
		}	
    });
   
    Config = Backbone.Collection.extend({
        
        model: Settings
    
    });
    
    
    // Authenticated Object ----------------- */
   
    Auth = Backbone.Model.extend({
        urlRoot: '/users/authenticate',
        defaults: {
            username: "",
            password: "",
            remember: false,
            fail: false,
            accepted: false
        },
        
        validate: function(attrs, options) {
            if(!attrs.username || !attrs.password) {
                return "error: username and pass are required";
            }
        }
    });
    
    Users = Backbone.Collection.extend({
        
        model: Auth
    
    });
        
});