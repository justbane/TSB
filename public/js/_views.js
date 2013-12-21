$(function() {
	
	/**
	 * Fix typeof
	 */
	var toType = function(obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	};


	/*
	 * Venue view --------------------------------
	 */
	VenueView = Backbone.View.extend({

		notifier: new Backbone.Notifier({
			closeBtn: true
		}),
		userInfo: null,
		venueData: null,

		initialize: function() {
			_.bindAll(this, 'setVenue', 'setUser', 'getItems', 'getDateTime', 'formatDates', 'formatDays', 'formatNumber', 'makeSlides', 'getImage', 'render');
            
            this.timerStart = +new Date();
            
			var notifier = this.notifier;
		},

		setVenue: function(venueData) {
			this.venueData = new Venue();
			this.venueData.on('invalid', function(model, error) {
				notifier.notify({
					'type': 'error',
					message: 'Error: Invalid venue credentials',
					destroy: true
				});
			});
			this.venueData.bind('change:venue', this.render);
			
			// Grab the settings
			this.settings = this.options.settings;
		},

		setUser: function(userInfo) {
			this.userInfo = userInfo;
		},

		getItems: function(initCheck) {

			var view = this;
			var notifier = this.notifier;
			var user = this.userInfo;

			if(user.venue_id) {
				this.venueData.set({
					vid: user.venue_id,
					key: $.cookie('k0skKey'),
					username: user.username
				});
			}
			
			// Start loading notifier
			if(toType(this.venueData.get('venue')) == 'undefined' && !initCheck) {
				var loader = notifier.notify({
					message: "Loading Specials...",
					position: 'center',
					fadeInMs: 0,
					fadeOutMs: 0,
					modal: true,
					loader: true
				});
			}
			
			// get the data
			this.venueData.save(null, {
				success: function(model, response, options) {
					model.set({
						venue: response
					});
					// set these in storage
					localStorage.setItem('k0skSpecialsCache', JSON.stringify(model.get('venue')));
					// kill the loader
					if(toType(loader) != 'undefined') {
						loader.destroy();
					}
					// Set the icon indicator
					$('#settings-button').show();
					$("#settings-button-no-con").hide();
					
				},
				error: function(model, response, options) {
					if(!initCheck) {
					    notifier.notify({
    						'type': 'error',
    						message: 'Error: Venue request encountered an error',
    						destroy: true
    					});
					}
					// Set the icon indicator
					$('#settings-button-no-con').show();
                    $("#settings-button").hide();
					// load the specials from cache
					var cachedSpecials = $.parseJSON(localStorage.getItem('k0skSpecialsCache'));
					model.set({
					    venue: cachedSpecials
					});
					
				}
			});
		},
		
		formatDays: function(string) {
			var chars = 3;
			if(this.specialDays.length < 4) {
                chars = 15;
            }
			return (string.charAt(0).toUpperCase() + string.slice(1)).substr(0, chars);
		},
		
		formatNumber: function(string) {
			switch(string) {
				case"1":
					string = string + "st";
					break;
				case"2":
					string = string + "nd";
					break;
				case"3":
					string = string + "rd";
					break;
				case"4":
				case"5":
					string = string + "th";
					break;
			}
			return string;
		},
		
		formatDates: function(special) {
			var validStartDate = new Date(special.start_date);
			var validEndDate = new Date(special.end_date);
			
			var startDate = {
				year: validStartDate.getFullYear(),
				month: validStartDate.getMonth() + 1,
				day: validStartDate.getDate()
			};
			var endDate = {
				year: validEndDate.getFullYear(),
				month: validEndDate.getMonth() + 1,
				day: validEndDate.getDate()
			};
			
			var dates = {
				start: startDate,
				end: endDate
			};
			
			return dates;
		},
		
		getDateTime: function(special) {
			
			var format = this.formatDays;
			var formatNum = this.formatNumber;
			var dateOut = "";
			var days = [
				"sunday",
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday"
			];
			
			// Setup the specialDays array based on the specials day
			var specialDays = [];
			_.each(days, function(day, key, list) {
				if(special[day] === 1) {
					specialDays.push(day);
				}
				// Switch Sunday
				if(specialDays[0] == 'sunday') {
				    // remove it
				    specialDays.splice(0, 1);
				    // replace it at the end.
				    specialDays.push('sunday');
				}
				
			});
			this.specialDays = specialDays;
			
			// Set the separator for the days
			var separator = " ";
			if(specialDays.length === 2) {
				separator = " and ";
			} else if(specialDays.length >= 3) {
				separator = ", ";
			}
            
            // Set recurring sentence language
			var recur = "";
			if((special.recurring > 0 && specialDays.length > 0) || (special.recurring > 0 && parseInt(special.recurring_day, 10) > 0)) {
				recur = "Every ";
			} else if(special.recurring == 0 && specialDays.length == 0) {
			    recur = "Every Day ";
			}
			
			// Form the string for special availability
			var daysString = "";
			// TODO fix day displays for missing days ina range eg: mon tu th fr
			if(specialDays.length > 0 && parseInt(special.recurring_day, 10) === 0) {
				_.each(specialDays, function(day, key, list) {
					daysString += format(day);
					if(day != _.last(specialDays) || specialDays.length == 1) {
						daysString += separator;
					} else {
						daysString += " ";
					}
				});
			
			} else if(specialDays.length === 0 && parseInt(special.recurring_day, 10) > 0) {
				daysString += formatNum(special.recurring_month) + separator + format(days[(parseInt(special.recurring_day, 10) -1)]) + separator;
			}
			
			if(daysString.length > 0) {
			    daysString = daysString + "<br />";
			}
			
			var startTime = special.start_time;
			var endTime = special.end_time;
			if(startTime !== "0" && endTime !== "0") {
				startEndTime = startTime + " - " + endTime;
			} else {
				startEndTime = "All Day";
			}
			
			var validStartDate = new Date(special.start_date);
			var validEndDate = new Date(special.end_date);
			
			var dates = this.formatDates(special);
			
			validStartString = dates.start.month + "/" + dates.start.day + "/" + dates.start.year;
			validEndString = dates.end.month + "/" + dates.end.day + "/" + dates.end.year;
			
			var formattedStrings = {
				date: recur + daysString,
				valid: startEndTime + " " + validStartString + " - " + validEndString
			};
			
			return formattedStrings;
		},

		makeSlides: function(specials) {

			var view = this;

			$('.flexslider ul.slides li').remove();

			if(specials.length > 0) {
				_.each(specials, function(special, key, list) {
					
					var dateData = view.getDateTime(special);
                    var dateString = dateData.date;
                    var validString = dateData.valid;

					var slideContent = '<li>';
					slideContent += '<img class="flex-spacer" src="/img/flex.png">';
					slideContent += '<div class="slide-content grid-100">';
					slideContent += '<div class="grid-35 tablet-grid-30 mobile-grid-100 special-img">';
					slideContent += '<div class="img-corners"><img class="img-rounded" src="' + view.getImage(special.image) + '"></div>';
					slideContent += '</div>';
					slideContent += '<div class="grid-65 tablet-grid-70 mobile-grid-100 special-details">';
					slideContent += '<h1 class="chalk">' + special.title + '</h1>';
					slideContent += '<h2 class="chalk">' + special.subtitle + '</h2>';
					slideContent += '<p>' + dateString + validString + '</p>';
					slideContent += '<p>' + special.body + '</p>';
					slideContent += '</div>';
					slideContent += '</div>';
					slideContent += '</li>';

					$('.flexslider ul.slides').append(slideContent);
				});
			}

		},

		getImage: function(imgpath) {

			var origpath = imgpath;
			var newpath = origpath.replace("200.png", "640.png");
			return newpath;

		},

		render: function() {

			var view = this;
			var specials = this.venueData.get('venue');
			var intervaltime = +new Date();
			var starttime = this.timerStart;
			var settings = this.settings;
			
			// set the venue logo
			if(this.userInfo.venue_image) {
				$('#venue-logo').html('<img src="'+ this.userInfo.venue_image +'" />');
			}
			
			// create the slides
			if(view.venueData.hasChanged('venue')) {
				/* Figure out why things go crazy when a slide is deleted
				*  so we can reenble async loading of slides
				*/  
				if($('.flexslider').eq(0).data('flexslider')) {
					$('.flexslider').eq(0).flexslider('destroy');
				}
				view.makeSlides(specials);
			}
            
			var slider = $('.flexslider').flexslider({
				animation: 'slide',
				slideshowSpeed: (settings.slideShowSpeed * 1000),
				animationSpeed: 600,
				controlNav: false,
				directionNav: false,
				pauseOnHover: false,
				pauseOnAction: false,
				easing: 'easeInOutExpo',
				start: function(slider) {
					// Initialize settings again to load the stored values in the slides
					var settings = new SettingsView({ el: $('#settings-block') });
					// Setup the slider items look and feel
					slider.find('.slide-content .special-details h1').fitText(1.7);
					slider.find('.slide-content .special-details h2').fitText(2);
					slider.find('.slide-content .special-details p').fitText(3);
					var interval = setInterval(function() {
						if(slider.count === 1) {
							view.getItems();
						} else {
							window.clearInterval(interval);
						}
					}, 600000);
				},
				end: function(slider) {
					if(intervaltime - starttime > 600000) {
					    // Bring the start timer up to date
					    starttime = +new Date();
					    view.timerStart = starttime;
					    // Check for new items
					    view.getItems();
					}
					intervaltime = +new Date();
				}
			});

		}

	});


	/**
    * Ads view
    */
    AdsView = Backbone.View.extend({
        
        initialize: function() {
            _.bindAll(this, 'setAdMedia', 'render');
            
            this.timerStart = +new Date();
            this.ads = new Ads();
            
            this.render();
        },
        
        setAdMedia: function() {
            var adsBlock = this;
            var venue = this.options.user;
            var ads = this.ads.get('paid');
            
            /* TODO: build ads mgnt. console. Model will get data...
             * For now we use single file name from S3 in venue user data
             */
            if(toType(ads) == 'undefined') {
                ads = this.ads.get('internal');
            }
            
            var str = '';
            // Build the ads array
            _.each(ads, function(item, key, list) {
                
                // Show the add
                switch(item.type) {
                    // Images
                    case'image':
                        str += '<div class="image">';
                        // str += '<img src="'+ item.assetUrl +'" />';
                        str += '<img src="'+ venue.sponsor_ad +'" />';
                        str += '</div>';
                        adsBlock.$el.find('.ads-content').html(str);
                        break;
                    
                    // Videos
                    /* case'video':
                        str += '<div class="video">';
                        str += '<video width="1024" height="576">';
                        str += '<source src="" type="video/mp4">';
                        str += '</video>';
                        str += '</div>';
                        adsBlock.$el.find('.ads-content').html(str);
                        adsBlock.$el.find('.ads-content > #ads-video > source').attr('src', 'https://s3-us-west-1.amazonaws.com/tsimagery/tsb/sponsors/GuinnessClip1.mp4');
                        break; */
                }
               

            });
        },
        
        render: function() {
            var adsBlock = this;
            var venue = this.options.user;
            var ads = this.ads;
            var startTime = this.timerStart;
            var interval = +new Date();
            
            // Insert ads content
            adsBlock.setAdMedia();
            
            /*
             * Account for sponsor ad missing or blank
             * This will need to do the same if ads are blank from model
             */
            if(toType(venue.sponsor_ad) == "undefined" || venue.sponsor_ad.length < 1 || $('#ad-block > .ads-content > div').length < 1) {
                return false;
            }
            
            // Check for our cookie and init the cookie variable
            var adToShow = 0;
            if($.cookie('adToShow')) {
               adToShow = parseInt($.cookie('adToShow')); 
            }
            
            setInterval(function() {
                interval = +new Date();
                
                // Handle cookie variable to ensure the ads cycle
                if(adToShow > $('#ad-block > .ads-content > div').length - 1) {
                    adToShow = 0;
                }
                
                // Get the item to show in the ads container
                var adItem = $('#ad-block > .ads-content > div').eq(adToShow);
                
                if((interval - startTime) > 90000 && $('#settings-block').css('display') == 'none') { // Every .5 min
                    // show the ad
                    
                    var modal = adsBlock.$el.modal({
                        keyboard: false, 
                        backdrop: 'static'
                    }).css({
                        'margin-left': function () {
                            return window.pageXOffset-($(this).width() / 2 );
                        }
                    });
                    
                    // Code for image ads
                    if(adItem.hasClass('image')) {
                        // Show the item in the modal
                        adItem.css('display', 'block');
                        var imgTimer = setTimeout(function() {
                            modal.modal('hide');
                            // Update the cookie
                            adToShow = adToShow + 1;
                            $.cookie('adToShow', adToShow);
                            // Reset our start time
                            startTime = interval;
                            clearTimeout(imgTimer);
                            // Hide the item
                            adItem.fadeOut('slow');
                        }, 8000);
                        
                    }
                    
                    // Code for video ads
                    if(adItem.hasClass('video')) {
                        // Show the item in the modal
                        adItem.css('display', 'block');
                        var video = adItem.find('video');
                        // Listen for modal to be shown
                        modal.on('shown', function(e) {
                            video.get(0).play();
                        });
                        // Listen for video end to hide modal
                        video.on('ended', function(e) {
                            modal.modal('hide'); 
                            // Reset our start time
                            startTime = interval;
                            // hide the item
                            adItem.fadeOut('slow');
                        });
                    }
                }
                
            }, 30000); // Every 1.5 min
            
        }
        
    });
	
	
	/**
	* Footer Ad view
	*/
	FooterView = Backbone.View.extend({
		
		initialize: function() {
			_.bindAll(this, 'getText', 'render');
			
			this.timerStart = +new Date();
			
			this.render();
		},
		
		getText: function() {
		    var venue = this.options.user;
		    var str = '<p>';
		          // str += 'Favorite ';
		          // str += venue.venue_title + ' on your phone!<br />';
		          //str += 'Get Today\'s Specials in the App Store & Google Play!';
		          str += 'Make ' + venue.venue_title + ' a Favorite & get Instant Updates';
		    str += '</p>';
		    
		    this.$el.find('#page-footer-right').html(str);
		    
		},
		
		render: function() {
			var footer = this;
			var startTime = this.timerStart;
			var interval = +new Date();
			
			setInterval(function() {
				if((interval - startTime) > 60000) {
					// show the ad
					footer.getText();
					footer.$el.show('fast', function() {
					    footer.$el.animate({
                            bottom : 0
                        }, {
                            duration : 1000,
                            easing : 'easeOutBounce'
                        });
					});
                    
                    // Set the timeout for hiding the ad
                    var hide = setTimeout(function() {
                        footer.$el.animate({
                            bottom : '-200px'
                        }, {
                            duration : 1000,
                            easing : 'easeInExpo'
                        }, function() {
                            footer.$el.hide();
                        });
                        clearTimeout(hide);
                    }, 10000);
                    // Reset our start time
					startTime = +new Date();	
				}
				interval = +new Date();
			}, 15000);
			
		}
		
	});
	
	
	/*
	 * Settings view -------------------------------
	 */
	SettingsView = Backbone.View.extend({

		initialize: function() {
			_.bindAll(this, 'render', 'logout', 'fullscreen', 'loadForm', 'setFont', 'saveSettings');

			this.settings = new Settings();
			this.settings.bind('change', this.render);
			
			var storedSettings = $.parseJSON(localStorage.getItem('k0skSettings'));
			
			if(storedSettings != null) {
				this.settings.set(storedSettings);
			} else {
				localStorage.setItem('k0skSettings', JSON.stringify(this.settings));
			}
			
			// populate the form with settings
			this.loadForm();

		},

		events: {
			'click button#settings': 'saveSettings',
			'click button#logout': 'logout',
			'click button#fullscreen': 'fullscreen'
		},

		logout: function() {
			$.cookie('k0skKey', null);
			$('#settings-block').modal('hide');
			location.reload();
		},
		
		fullscreen: function() {
			
			var view = this.$el;
			
			if($.support.fullscreen){

                $('#main').fullScreen({
                //  'background'    : '#111',
                    'callback'      : function(isFullScreen){
                        // Fix the FullScreen button
                        view.find('button#fullscreen').addClass('disabled');
                        view.find('button#fullscreen').attr('disabled', 'disabled');
                    }
                });
                
            }
		},
		
		loadForm: function() {
			
			var settings = this.settings;
			_.each(this.$el.find('.input'), function(item, key, list) {
			
				$(item).val(settings.get($(item).attr('id')));

			});
			
			// Listeners for the color pickers - TODO fix this make it less procedural
			// Header title color
			$('#headerColor').on('change', function() {
			    $('#headerColorHex').val($(this).val());
			});
			$('#headerColorHex').on('change', function() {
                $('#headerColor').val($(this).val());
            });
            // Special title color
			$('#specialTitleColor').on('change', function() {
                $('#specialTitleColorHex').val($(this).val());
            });
            $('#specialTitleColorHex').on('change', function() {
                $('#specialTitleColor').val($(this).val());
            });
            // Special subtitle color
            $('#specialSubTitleColor').on('change', function() {
                $('#specialSubTitleColorHex').val($(this).val());
            });
            $('#specialSubTitleColorHex').on('change', function() {
                $('#specialSubTitleColor').val($(this).val());
            });
            // Special body color
            $('#specialBodyColor').on('change', function() {
                $('#specialBodyColorHex').val($(this).val());
            });
            $('#specialBodyColorHex').on('change', function() {
                $('#specialBodyColor').val($(this).val());
            });

		},
		
		setFont: function(elem, font) {
			
			var fonts = new Fonts();
			var classes = fonts.get('availablefonts');
			
			// remove font classes
			_.each(classes, function(fontclass, key, list) {
				elem.removeClass(fontclass);
			});
			// add the new class
			elem.addClass(font);
			
		},

		render: function() {
			
			// Render Board headline
			$('#page-headline h1').html(this.settings.get('headerText'));
			$('#page-headline h1').css('color', this.settings.get('headerColor'));
			this.setFont($('#page-headline h1'), this.settings.get('headerFont'));
			
			// Special Title
            $('.special-details h1').css('color', this.settings.get('specialTitleColor'));
            this.setFont($('.special-details h1'), this.settings.get('specialTitleFont'));
			
			// Special Subtitle
			$('.special-details h2').css('color', this.settings.get('specialSubTitleColor'));
            this.setFont($('.special-details h2'), this.settings.get('specialSubTitleFont'));
			
			// Special Detail
			$('.special-details p').css('color', this.settings.get('specialBodyColor'));
            this.setFont($('.special-details p'), this.settings.get('specialBodyFont'));
            
            // Render the FullScreen Button appropriately
            if($.support.fullscreen){
				this.$el.find('button#fullscreen').removeClass('disabled');
				this.$el.find('button#fullscreen').removeAttr('disabled');
            }
            
		},

		saveSettings: function() {
			
			var attribs = {
				slideAnimation: 'slide',
				slideShowSpeed: this.$el.find('input#slideShowSpeed').val(),
				headerText: this.$el.find('input#headerText').val(),
				headerColorHex: this.$el.find('input#headerColorHex').val(),
				headerColor: this.$el.find('input#headerColorHex').val(),
				headerFont: this.$el.find('select#headerFont').val(),
				specialTitleFont: this.$el.find('select#specialTitleFont').val(),
				specialTitleColorHex: this.$el.find('input#specialTitleColorHex').val(),
				specialTitleColor: this.$el.find('input#specialTitleColorHex').val(),
				specialSubTitleFont: this.$el.find('select#specialSubTitleFont').val(),
				specialSubTitleColorHex: this.$el.find('input#specialSubTitleColorHex').val(),
				specialSubTitleColor: this.$el.find('input#specialSubTitleColorHex').val(),
				specialBodyFont: this.$el.find('select#specialBodyFont').val(),
				specialBodyColorHex: this.$el.find('input#specialBodyColorHex').val(),
				specialBodyColor: this.$el.find('input#specialBodyColorHex').val()
			};
			
			// check for slideShowSpeed change
			var reload = false;
            if(attribs.slideShowSpeed != this.settings.get('slideShowSpeed')) {
                reload = true;  
            }
			
			this.settings.set(attribs);
			localStorage.setItem('k0skSettings', JSON.stringify(attribs));
			this.loadForm();
			this.render();
			
			// reload if speed changed
			if(reload) {
			    location.reload();
			}
		}

	});


	/*
	 * User view -----------------------------------
	 */
	UserView = Backbone.View.extend({

		notifier: new Backbone.Notifier({
			closeBtn: true
		}),

		initialize: function() {
			_.bindAll(this, 'authenticate', 'submitOnEnter', 'render');

			var notifier = this.notifier;

			// Auth model
			this.auth = new Auth();
			this.auth.on('invalid', function(model, error) {
				notifier.notify({
				    'type': 'error',
				    message: 'Please enter a username and password',
				    destroy: true
				});
			});
			this.auth.bind('change:k0sk', this.render);

		},

		events: {
			'click button#login': 'authenticate',
			'keypress input': 'submitOnEnter'
		},
		
		submitOnEnter: function(e) {
		    if (e.keyCode != 13) return;
            this.authenticate();
		},

		authenticate: function() {

			var notifier = this.notifier;

			// Get the values
			var form = this.$el.find('#login-form');
			var username = this.$el.find('#username').val();
			var password = this.$el.find('#passwd').val();

			try {
				this.auth.save({
					username: username,
					password: password
				}, {
					success: function(model, response, options) {
						/* update the view now */
						// console.log(response.apiKey);
						if(response.apiKey) {
							var user = model.get('user');
							user.username = username;

							// locally store the user object
							$.cookie('k0skKey', response.apiKey, { expires: 365 * 10 });
							localStorage.setItem('k0skUser', JSON.stringify(user));
							model.set('k0sk', response);
						}
					},
					error: function(model, xhr, options) {
						/* handle the error code here */
						notifier.notify({
						    'type': 'error',
						    message: 'Login Failed: Please check your username and password and try again',
						    destroy: true
						});
					}
				});
			} catch(err) {
				// caught
			}


		},

		render: function() {
			$('#login-block').modal('hide');
			var k0sk = this.auth.get('k0sk');
			// set the venue logo
			if(k0sk.user.venue_image) {
				$('#venue-logo').html('<img src="'+ k0sk.user.venue_image +'" />');
			}
		}
	});
	
	
	/*
	 * Reloader view ------------------------
	 */
	ReloaderView = Backbone.View.extend({
	    
	    notifier: new Backbone.Notifier({
            closeBtn: true
        }),
        
        initialize: function() {
            _.bindAll(this, 'render');

            var notifier = this.notifier;

            // Venue model
            this.venue = new Venue();
            
            this.render();

        },
        
        render: function() {
            
            var venue = this.venue;
            var user = this.options.user;
            var notifier = this.notifier;
            
            if(user.venue_id) {
                venue.set({
                    vid: user.venue_id,
                    key: $.cookie('k0skKey'),
                    username: user.username
                });
            }
            
            setInterval(function() {
                // Try to get venue data to check connection
                venue.save(null, {
                    success: function(model, response, options) {
                        // Success? reload the page
                        location.reload();
                    },
                    error: function(model, response, options) {
                        // caught - do nothing.
                        notifier.notify({
                            'type': 'error',
                            message: 'Error: Venue request encountered an error',
                            destroy: true
                        });
                        $('#settings-button-no-con').show();
						$("#settings-button").hide();
                    }
                });
                
            }, 28800000);
            
        }
        
	});

});
