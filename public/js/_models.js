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
    
    
    // Ads Defaults ----------------- */
    Ads = Backbone.Model.extend({
        defaults: {
            internal: {
               sierra: {
                   assetUrl: 'https://s3-us-west-1.amazonaws.com/tsimagery/tsb/sponsors/sierra-nevada-1024.jpg',
                   type: 'image',
                   vendor: 'sierra'
               },
               amex: {
                   assetUrl: 'https://s3-us-west-1.amazonaws.com/tsimagery/tsb/sponsors/amex-1024.jpeg',
                   type: 'image',
                   vendor: 'amex'
               } 
            }
        }
    });
    
   
    AdServer = Backbone.Collection.extend({
        
        model: Ads
    
    });
    
    
    // Settings Defaults ----------------- */
    Settings = Backbone.Model.extend({
    
        defaults: {
            slideAnimation: 'slide',
            animationTimeout: 3000,
            headerText: "Today's Specials",
            headerColorHex: "#ffffff",
            headerColor: "#ffffff",
            headerFont: "chalk",
            specialTitleFont: "chalk",
            specialTitleColorHex: "#ffffff",
            specialTitleColor: "#ffffff",
            specialSubTitleFont: "chalk",
            specialSubTitleColorHex: "#ffffff",
            specialSubTitleColor: "#ffffff",
            specialBodyFont: "arial",
            specialBodyColorHex: "#ffffff",
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