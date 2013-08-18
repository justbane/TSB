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
		},

		setUser: function(userInfo) {
			this.userInfo = userInfo;
		},

		getItems: function() {

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
			if(toType(this.venueData.get('venue')) == 'undefined') {
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
					// kill the loader
					if(toType(loader) != 'undefined') {
						loader.destroy();
					}
				},
				error: function(model, response, options) {
					notifier.notify({
						'type': 'error',
						message: 'Error: Venue request encountered an error',
						destroy: true
					});
				}
			});
		},
		
		formatDays: function(string) {
			return (string.charAt(0).toUpperCase() + string.slice(1)).substr(0, 3);
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
			
			var specialDays = [];
			_.each(days, function(day, key, list) {
				if(special[day] === 1) {
					specialDays.push(day);
				}
				
			});
			
			var separator = " ";
			if(specialDays.length === 2) {
				separator = " and ";
			} else if(specialDays.length === 3) {
				separator = ", ";
			} else if(specialDays.length > 3) {
				separator = " - ";
			}
			
			var recur = "";
			if(special.recurring > 0) {
				recur = "Every ";
			}
			
			var daysString = "";
			if(specialDays.length > 3) {
				daysString += format(_.first(specialDays)) + " - " + format(_.last(specialDays)) + separator;
			
			} else if(specialDays.length < 3 && parseInt(special.recurring_day, 10) === 0) {
				_.each(specialDays, function(day, key, list) {
					daysString += format(day);
					if(day != _.last(specialDays) || specialDays.length == 1) {
						daysString += separator;
					}
				});
			
			} else if(specialDays.length === 0 && parseInt(special.recurring_day, 10) > 0) {
				daysString += formatNum(special.recurring_month) + separator + format(days[(parseInt(special.recurring_day, 10) - 1)]) + separator;
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
				date: recur + daysString + startEndTime,
				valid: validStartString + " - " + validEndString
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
					slideContent += '<p>' + dateString + "&nbsp;&nbsp;" + validString + '</p>';
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
				animationSpeed: 1000,
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
					}, 10000);
				},
				end: function(slider) {
					view.getItems();
				}
			});

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
		          str += 'Favorite ';
		          str += venue.venue_title;
		          str += ' on your phone to get updates!<br />Get Today\'s Specials in the App Store & Google Play';
		    str += '</p>';
		    
		    this.$el.find('#page-footer-right').html(str);
		    
		},
		
		render: function() {
			var footer = this
			var startTime = this.timerStart;
			var interval = +new Date();
			setInterval(function() {
				if((interval - startTime) > 120000) {
					// show the ad
					footer.getText();
                    footer.$el.animate({
                        bottom : 0
                    }, {
                        duration : 1000,
                        easing : 'easeOutBounce'
                    });
                    // Set the timeout for hiding the ad
                    var hide = setTimeout(function() {
                        footer.$el.animate({
                            bottom : '-200px'
                        }, {
                            duration : 1000,
                            easing : 'easeInExpo'
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
				animationTimeout: 3000,
				headerText: this.$el.find('input#headerText').val(),
				headerColor: this.$el.find('input#headerColor').val(),
				headerFont: this.$el.find('select#headerFont').val(),
				specialTitleFont: this.$el.find('select#specialTitleFont').val(),
				specialTitleColor: this.$el.find('input#specialTitleColor').val(),
				specialSubTitleFont: this.$el.find('select#specialSubTitleFont').val(),
				specialSubTitleColor: this.$el.find('input#specialSubTitleColor').val(),
				specialBodyFont: this.$el.find('select#specialBodyFont').val(),
				specialBodyColor: this.$el.find('input#specialBodyColor').val()
			};
			
			this.settings.set(attribs);
			localStorage.setItem('k0skSettings', JSON.stringify(attribs));
			this.render();
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
							$.cookie('k0skKey', response.apiKey);
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

});