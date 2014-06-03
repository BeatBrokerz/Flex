/**
 * BB Flex Widget API - jQuery Plugin
 * Version: 1
 * URL: http://www.beatbrokerz.com/api/flex
 * Description: Extends Beat Brokerz music and facilities via embeddable widgets
 * Requires: jQuery 2.0.x or higher, jPlayer, jPlaylist
 * Author: Kevin Carwile
 * Copyright: Copyright 2013 Beat Brokers Global ALL RIGHTS RESERVED
 * License:
 */

(function ($) {

    $.appflow = function (method) {

        // Method calling logic
        if ($.appflow.methods[method]) {
            return $.appflow.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return $.appflow.methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist.');
        }

    };

    $.appflow.config = {
        sequences: {
            _default: [ 'before', 'process', 'render', 'after' ]
        }
    };

    $.appflow.process = {};

    (function (config, process) {
        $.appflow.methods = {
            init: function (options) {
                config = $.extend(config, options);
            },
            sequence: function (hook, sequence) {
                if (sequence) {
                    config.sequences[hook] = sequence;
                }
                else {
                    return config.sequences[hook] || config.sequences._default
                }
            },
            bind: function (event, hook, func) {
                if (typeof(hook) == 'function') {
                    func = hook;
                    hook = "process";
                }
                if (typeof(process[event]) == 'undefined') process[event] = {};
                if (typeof(process[event][hook]) == 'undefined') process[event][hook] = [];
                process[event][hook].push(func);
            },
            trigger: function () {
                var args = [];
                for (n = 0; n < arguments.length; n++) {
                    args.push(arguments[n]);
                }
                var hooks = args.shift();
                var e = hooks.split(":");
                var event = e.shift();
                if (!event) return;
                if (typeof(process[event]) == 'undefined') {
                    process[event] = {};
                }
                var sequence = e.length ? e : config.sequences[event] || config.sequences._default;
                var bypass = {};
                var forks = [];
                var halt = false;
                var eventData = {
                    eventName: event,
                    halt: function(status) {
                        halt = status !== false;
                    },
                    fork: function(newEvents) {
                        if (!newEvents) return;
                        typeof newEvents === 'string' ? forks.push(newEvents) : $.each(newEvents, function (i, newEvent) {
                            forks.push(newEvent);
                        });
                    },
                    bypass: function(stages) {
                        if (!stages) return;
                        typeof stages === 'string' ? bypass[stages] = true : $.each(stages, function (i, stage) {
                            bypass[stage] = true;
                        });
                    }
                };
                if (this.eventName) {
                    var _eventData = $.extend({}, this);
                    delete _eventData.eventName;
                    delete _eventData.eventStage;
                    delete _eventData.halt;
                    delete _eventData.fork;
                    delete _eventData.bypass;
                    $.extend(eventData, _eventData);
                }

                for (var i in sequence) {

                    if (halt) continue;
                    var hook = sequence[i];
                    if (bypass[hook]) continue;
                    eventData.eventStage = hook;
                    forks = [];
                    // trigger hooks before event
                    if (typeof(process[event][hook]) != 'undefined') {
                        $.each(process[event][hook], function (index, value) {
                            var result = process[event][hook][index].apply(eventData, args);
                            if (typeof result === 'object' && result.control) {
                                if (result.control.fork) {
                                    typeof result.control.fork === 'string' ? forks.push(result.control.fork) : $.each(result.control.fork, function (i, trig) {
                                        forks.push(trig);
                                    });
                                }
                                if (result.control.bypass) {
                                    typeof result.control.bypass === 'string' ? bypass[result.control.bypass] = true : $.each(result.control.bypass, function (i, h) {
                                        bypass[h] = true;
                                    });
                                }
                                if (result.control.halt) {
                                    halt = true;
                                }
                                delete result.control;
                            }
                            if (typeof result === 'object') {
                                $.extend(eventData, result);
                            }
                            if (halt) {
                                return false;
                            }
                        });
                    }
                    if (forks.length) {
                        for (var i in forks) {
                            var _args = args;
                            _args.unshift(forks[i]);
                            $.extend(eventData, $.appflow.trigger.apply(eventData, _args));
                        }
                    }
                }

                delete eventData.eventName;
                delete eventData.eventStage;
                delete eventData.halt;
                delete eventData.fork;
                delete eventData.bypass;

                return eventData;

            }
        };
    })($.appflow.config, $.appflow.process);

    $.appflow.trigger = $.appflow.methods['trigger'];
    $.appflow.bind = $.appflow.methods['bind'];
    $.appflow.sequence = $.appflow.methods['sequence'];

    $.bbflex = function (method) {

        if ($.bbflex.methods[method]) {
            var elements;
            var selection = arguments[1];
            switch (typeof(selection)) {
                case 'object' :
                    elements = selection instanceof Array ? $(selection.join(",")) : selection;
                    break;
                case 'string' :
                    elements = $(selection);
                    break;
                default :
                    // default selector for widgets
                    elements = $("[data-bbflex]");
            }
            return elements.each(function () {
                $.bbflex.methods[method].apply(this, Array.prototype.slice.call(arguments, 2))
            });
        }
        else if (typeof method === 'object' || !method) {
            $.extend($.bbflex.config, method);
        }
        else {
            $.error('Method ' + method + ' does not exist.');
        }

    };

    $.fn.bbflex = function (method) {
        if (typeof method === 'object' || !method) {
            return $.bbflex.methods.load.call(this, method);
        }
        else if (typeof method === 'string') {
            if ($.bbflex.methods[method]) {
                return $.bbflex.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else {
                $.error('Method ' + method + ' does not exist.');
            }
        }
    };

    // default configuration
    $.bbflex.config = {
        initialized: false,
        apikey: "",
        jplayerSelector: "#bbflex-audio",
        jplayer: {
            swfPath: 'https://www.beatbrokerz.com/flex/jplayer.swf',
            supplied: 'mp3',
            solution: 'html, flash',
            volume: $.cookie('_vol') || 0.7,
            globalVolume: true,
            cssSelectorAncestor: "disabled_by_design",
            playlistOptions: {
                autoPlay: false,
                loopOnPrevious: false,
                shuffleOnLoop: true,
                enableRemoveControls: false,
                displayTime: 0,
                addTime: 'fast',
                removeTime: 'fast',
                shuffleTime: 'slow'
            }
        },
        fw_interface: {
            cssSelector: {
                play: ".fw-play",
                pause: ".fw-pause",
                previous: ".fw-previous",
                next: ".fw-next",
                stop: ".fw-stop",
                seekBar: ".fw-seek-bar",
                playBar: ".fw-play-bar",
                mute: ".fw-mute",
                unmute: ".fw-unmute",
                volumeBar: ".fw-volume-bar",
                volumeBarValue: ".fw-volume-bar-value",
                volumeMax: ".fw-volume-max",
                currentTime: ".fw-current-time",
                duration: ".fw-duration",
                fullScreen: ".fw-full-screen",
                repeat: ".fw-repeat",
                repeatOff: ".fw-repeat-off"
            },
            verticalVolume: false
        },
        playlists: {
            page: []
        },
        currentPlaylist: 'page'
    };

    /*
     *  This function should be called when all configuration options have been
     *  set, and we're ready to load the playlist player on the page.
     */

    $.bbflex.init = function (options) {

        var config = $.bbflex.config;
        $.extend(config, options);
        if (config.initialized) {
            return $.bbflex.player;
        }

        // automagically make a spot for our player if it doesn't have one
        if (!$(config.jplayerSelector).length) {
            $.bbflex.config.jplayerSelector = "#bbflex-audio";
            config = $.bbflex.config;
            $("body").append('<div id="bbflex-audio"></div>');
        }

        // initialize our music player
        $.jPlayer.timeFormat.padMin = false;
        $.bbflex.player = new jPlayerPlaylist(
            {
                jPlayer: config.jplayerSelector,
                cssSelectorAncestor: config.jplayer.cssSelectorAncestor
            },
            config.playlists[config.currentPlaylist],
            config.jplayer
        );

        /*
         * Bind our appflow events for app integration
         */

        // we need to bind our app events to the primary jplayer instance, and we pass the
        // jPlayerPlaylist object in as well so that we can access it later
        $.bbflex.core = $(config.jplayerSelector).bbflex('appbind', $.bbflex.player);

        $.appflow.trigger('bbflex-initialized', $.bbflex, $.bbflex.core);
        $.bbflex.config.initialized = true;

        // load all widgets on the page
        $.bbflex('load');

        return $.bbflex.player;

    };

    // methods invoked using jQuery selection (this = jQuery object)
    $.bbflex.methods = {

        load: function (config) {
            if (!$(this).hasClass('widget-loaded') || config) {
                $(this).data('data-bbflex', config);
                var settings = $.bbflex.getSettings(this);
                if (settings.widget) {
                    var template = $.bbflex.widgets[settings.widget];
                    if (typeof template !== 'undefined') {
                        settings = $.extend({}, template.settings, settings);
                        var theme = (settings.theme || 'default').replace(/[^A-Za-z0-9-]/, '');
                        var widgetname = settings.widget.replace(/[^A-Za-z0-9-]/, '');
                        var widget = $(this)
                            .addClass('flex-widget fw-theme-' + theme + ' flex-widget-' + widgetname)
                            .html(template.html(template, settings));
                        $.appflow.trigger('bbflex-widget-loading', widget);
                        template.init.call(this, template, widget, settings);
                        $.appflow.trigger('bbflex-widget-initialized', widget.addClass('widget-loaded'));
                    }
                }
                if ($(this).find('[data-bbflex]').length) $(this).find('[data-bbflex]').each(function () {
                    $(this).bbflex('load');
                });
            }
            return this;
        },

        resize: function (config) {
            $(this).css({ width: config.width, height: config.height });
            var resizeWidget = function (el) {
                var settings = $.bbflex.getSettings(el);
                $.extend(settings, config);
                var template = $.bbflex.widgets[settings.widget];
                if (typeof template !== 'undefined') {
                    settings = $.extend(template.settings || {}, settings);
                    if (typeof template.adjustSize === 'function') {
                        template.adjustSize(template, $(el), settings);
                    }
                }
            }
            // since widgets get resized individually, we do this twice for things to settle
            for (x = 1; x <= 1; x++) {
                if ($(this).attr('data-bbflex')) {
                    resizeWidget(this);
                }
                $(this).find('[data-bbflex]').each(function () {
                    resizeWidget(this);
                });
            }
            $.appflow.trigger('bbflex-widget-resized', $(this));
            return this;
        },

        antiscroll: function (options) {

            var widget = $(this);

            if (!widget.children().hasClass('antiscroll-wrap')) {
                widget.wrapInner('<div class="antiscroll-wrap"><div class="antiscroll-inner"><div class="antiscroll-wrap-inner">');
            }

            widget.find('.antiscroll-wrap .antiscroll-wrap-inner').css({ 'min-height': 10000 });
            widget.find('.antiscroll-inner').css({ height: $(this).height(), width: '' });
            widget.find('.antiscroll-wrap').antiscroll();
            widget.find('.antiscroll-wrap .antiscroll-wrap-inner').css({ 'min-height': 0 });

            return this;
        },

        appbind: function (playlistObj) {
            $(this)
                .bind($.jPlayer.event.play, function (event) {
                    $.appflow.trigger('bbflex-play', event, $(this));
                }) 			// play
                .bind($.jPlayer.event.pause, function (event) {
                    $.appflow.trigger('bbflex-pause', event, $(this));
                }) 			// pause
                .bind($.jPlayer.event.volumechange, function (event) {
                    $.appflow.trigger('bbflex-volumechange', event, $(this));
                })	// volume change
                .bind($.jPlayer.event.ended, function (event) {
                    $.appflow.trigger('bbflex-ended', event, $(this));
                }) 			// play ended
                .bind($.jPlayer.event.timeupdate, function (event) {
                    $.appflow.trigger('bbflex-timeupdate', event, $(this));
                }) 		// time updated
                .bind($.jPlayer.event.seeking, function (event) {
                    $.appflow.trigger('bbflex-seeking', event, $(this));
                }) 			// seeking
                .bind($.jPlayer.event.progress, function (event) {
                    $.appflow.trigger('bbflex-progress', event, $(this));
                }) 		// media downloading
                .bind($.jPlayer.event.repeat, function (event) {
                    $.appflow.trigger('bbflex-repeat', event, $(this));
                }) 			// repeat state changed
                .bind($.jPlayer.event.error, function (event) {
                    $.appflow.trigger('bbflex-jplayer-error', event, $(this));
                })
                .data('jPlayerPlaylist', playlistObj);
            return this;
        },

        applyBindings: function () {
            var selection = this;
            if (flexloader != undefined) {
                flexloader.execute(function ($, myApp) {
                    selection.each(function () {
                        if ($.ko) {
                            $.ko.applyBindings(myApp.baseVars, $(this)[0]);
                        }
                        else {
                            console.log('$.ko does not exist!');
                        }
                    });
                });
            }
            return this;
        }

    };

    $.bbflex.getSettings = function (element) {
        var options = {};
        if ($(element).attr('data-bbflex')) {
            // happy html entity decoding :)
            var settings = $('<textarea>').html($(element).attr('data-bbflex')).text();
            try {
                // check if our settings is a valid json string
                options = $.parseJSON(settings);
            } catch (e) {
                // nope. we'll try to parse it ourself
                if (settings) {
                    settings = settings.replace(/^[\s{]+|[\s}]+$/g, "");
                    $.each(settings.split(','), function (i, param) {
                        if (param) {
                            var parts = param.split(':');
                            var name = parts[0] ? $.trim(parts[0]).replace(/^[\s'"]+|[\s'"]+$/g, "") : undefined;
                            var value = parts[1] ? $.trim(parts[1]).replace(/^[\s'"]+|[\s'"]+$/g, "") : undefined;
                            value = value == 'true' ? true : value == 'false' ? false : value;
                            if (name != undefined) {
                                options[name] = value;
                            }
                        }
                    });
                }
            }
        }
        else {
            $(element).attr('data-bbflex', '{}');
        }
        $.extend(options, $(element).data('data-bbflex'));
        return options;
    };

    var fw_interface = $.bbflex.config.fw_interface;

    $.bbflex.widgets = {

        playbar: {

            settings: {
                fullscreen: true
            },

            html: function (template, settings) {

                return '\
	    <div class="fw-interface-controls-wrap fw-jplayer-interface">\
		<div class="fw-controls">\
			<a href="javascript:;" class="fw-previous jp-button" tabindex="1"><i class="flexicon-fast-bw"></i></a>\
			<a href="javascript:;" data-bind="visible: music.paused" class="fw-play jp-button" tabindex="1"><i class="flexicon-play"></i></a>\
			<a href="javascript:;" data-bind="visible: music.playing" class="fw-pause jp-button" tabindex="1"><i class="flexicon-pause"></i></a>\
			<a href="javascript:;" class="fw-next jp-button" tabindex="1"><i class="flexicon-fast-fw"></i></a>\
			<span class="divider"></span>\
		</div>\
		<div class="fw-progress-container">\
			<div class="fw-progress">\
				<div class="fw-seek-bar">\
					<div class="fw-play-bar">\
						<div class="bullet">\
							<div class="fw-current-time">\
							</div>\
						</div>\
					</div>\
				</div>\
			</div>\
			<span class="divider"></span>\
		</div>\
		<div class="fw-volume-bar-container">\
			<a data-bind="visible: !music.muted()" href="javascript:;" class="fw-mute" tabindex="1"><i class="flexicon-volume-up"></i></a>\
			<a data-bind="visible: music.muted()" href="javascript:;" class="fw-unmute" tabindex="1"><i class="flexicon-volume-down"></i></a>\
			<div class="fw-volume-bar">\
				<div class="fw-volume-bar-value">\
					<div class="bullet"></div>\
				</div>\
			</div>\
		</div>\
		<div class="fw-full-screen-container">\
			<a href="javascript:;" class="fw-fullscreen jp-button" tabindex="1"><i class="fwicon-resize-full"></i></a>\
		</div>\
	    </div>\
	';
            },
            init: function (template, widget, settings) {

                var myApp = window[myAppNamespace] || { appSettings: {} };
                if (settings.fullscreen && myApp.appSettings.bootmode != 'disabled') {
                    widget.addClass('fullscreen-control');
                }

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});

                widget.find('.fw-progress-container').hover(function () {
                    var current_time = $(this).find('.fw-current-time');
                    current_time.stop().show().animate({opacity: 1}, 300);
                }, function () {
                    var current_time = $(this).find('.fw-current-time');
                    current_time.stop().animate({opacity: 0}, 150, function () {
                        $(this).hide();
                    });
                });

                widget.find('.fw-fullscreen').click(function () {
                    window[myAppNamespace].fullScreen();
                });

                window[myAppNamespace].Music.addInterface(widget, fw_interface);

                template.adjustSize(template, widget, settings);

            },
            adjustSize: function (template, widget, settings) {

                if (widget.width() < 280) {
                    widget.addClass('reduce-volume-bar');
                } else {
                    widget.removeClass('reduce-volume-bar');
                }
                if (widget.width() < 200) {
                    widget.find('.fw-progress-container').addClass('hide');
                } else {
                    widget.find('.fw-progress-container').removeClass('hide');
                }
                if (widget.width() < 160) {
                    widget.find('.fw-controls').css({ left: parseInt((widget.width() - 116) / 2) });
                    widget.find('.fw-volume-bar-container,.divider').addClass('hide');
                } else {
                    widget.find('.fw-controls').css({ left: '' });
                    widget.find('.fw-volume-bar-container,.divider').removeClass('hide');
                }

            }
        },

        progressbar: {

            html: function (template, settings) {

                return '\
	    <div class="fw-interface-controls-wrap fw-jplayer-interface">\
		<div class="fw-progress-container">\
		        <div class="fw-current-time"></div>\
			<div class="fw-progress">\
				<div class="fw-seek-bar">\
					<div class="fw-play-bar">\
						<div class="bullet">\
						</div>\
					</div>\
				</div>\
			</div>\
                        <div class="fw-duration"></div>\
		</div>\
	    </div>\
	';
            },
            init: function (template, widget, settings) {

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});

                window[myAppNamespace].Music.addInterface(widget, fw_interface);

            }
        },

        cart: {

            settings: {
                scroll: false
            },

            html: function (template, settings) {
                return '\
	\
	<div class="fw-cart-item-list" data-bind="dxList: { dataSource: cart().items, scrollingEnabled: false, itemClickAction: function(action) { window[myAppNamespace].Music.showLicense(action.itemData); }, noDataText: \'No products here. Time to get shopping!\'  }">\
	  <div class="fw-cart-item" data-options="dxTemplate: { name: \'item\' }">\
	    <div class="fw-cart-item-wrapper">\
	      <div class="fw-cart-item-qty" data-bind="text: qty + \' x\'"></div>\
	      <div class="fw-cart-item-price">$<span data-bind="text: price"></span></div>\
	      <div class="fw-cart-item-title" data-bind="text: title"></div>\
	      <div class="fw-cart-item-model">&raquo; <span data-bind="text: model"></span></div>\
	    </div>\
	  </div>\
	</div>\
	\
	';
            },
            init: function (template, widget, settings) {

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});
                template.adjustSize(template, widget, settings);

            },
            adjustSize: function (template, widget, settings) {
                if (settings.scroll) widget.bbflex('antiscroll');
            }

        },

        playlist: {

            settings: {
                scroll: false,
                playlist: ''
            },

            html: function (template, settings) {
                return '\
	  <ul class="fw-playlist-items" data-bind="foreach: ' + (settings.playlist ? 'music.Playlist[\'' + settings.playlist + '\']' : 'music.activePlaylistItems') + '">\
	    <li><a href="javascript:;" data-bind="html: title"></a></li>\
	  </ul>\
	  <div class="fw-playlist-loading"><i class="fwicon-down-dir"></i> Load More...</div>\
	';
            },
            init: function (template, widget, settings) {

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});

                if (settings.scroll) {
                    widget.bbflex('antiscroll');
                }

                $.appflow.bind('bbflex-nowplaying', function (media) {
                    widget.find('.fw-playlist-items li.fw-playlist-current').removeClass('fw-playlist-current')
                    var li = widget.find('.fw-playlist-items li')[media.playlistIndex];
                    $(li).addClass('fw-playlist-current');
                });

                widget.on('click', '.fw-playlist-items li a', function () {
                    var playlistIndex = $(this).closest('li').index();
                    var id = settings.playlist || window[myAppNamespace].Music.currentPlaylist;
                    window[myAppNamespace].Music.playMedia(window[myAppNamespace].Music.playlists[id].media[playlistIndex]);
                });

                $.appflow.bind('bbflex-playlist-outofdata', function (playlist) {
                    if (!settings.playlist || settings.playlist == playlist.id) {
                        widget.find('.fw-playlist-loading').css('display', 'none');
                    }
                });

                $.appflow.bind('bbflex-playlist-changed', function (id) {
                    if (!settings.playlist) {
                        window[myAppNamespace].Music.playlists[id].dataSource ?
                            widget.find('.fw-playlist-loading').css('display', '') :
                            widget.find('.fw-playlist-loading').css('display', 'none');
                    }
                });

                $.appflow.bind('bbflex-ajax-working', function (params) {
                    if (params && params.data && params.data.music) {
                        if (settings.playlist && settings.playlist != params.data.music) return;
                        if (!settings.playlist && params.data.music != window[myAppNamespace].Music.currentPlaylist) return;
                        widget.activity();
                    }
                });

                $.appflow.bind('bbflex-ajax-complete', function (params) {
                    if (params && params.data && params.data.music) {
                        if (settings.playlist && settings.playlist == params.data.music) {
                            widget.activity(false);
                        }
                        if (!settings.playlist && params.data.music == window[myAppNamespace].Music.currentPlaylist) {
                            widget.activity(false);
                        }
                    }
                });

                if (settings.playlist && !window[myAppNamespace].Music.playlists[settings.playlist].dataSource) {
                    widget.find('.fw-playlist-loading').css('display', 'none');
                }

                widget.find('.fw-playlist-loading').click(function () {
                    $.appflow.trigger('bbflex-playlist-scrolled-bottom', settings.playlist, widget);
                });

                if (settings.scroll) {
                    widget.find('.antiscroll-inner').scroll(function () {
                        var scroller = $(this);
                        var pixelsToBottom = scroller[0].scrollHeight - scroller.scrollTop();
                        if (pixelsToBottom == scroller.closest('.antiscroll-wrap').outerHeight() && pixelsToBottom < scroller[0].scrollHeight) {
                            $.appflow.trigger('bbflex-playlist-scrolled-bottom', settings.playlist, widget);
                        }
                    });
                }

            },
            adjustSize: function (template, widget, settings) {
                if (settings.scroll) widget.bbflex('antiscroll');
            }
        },

        playlists: {

            settings: {
                scroll: false
            },

            html: function (template, settings) {
                return '\
	  <div class="fw-playlists" data-bind="dxList: { dataSource: music.groupedPlaylists, grouped: true, scrollingEnabled: false, itemClickAction: function(action) { music.changePlaylist(action.itemData); }, noDataText: \'No playlists to choose from.\'  }">\
	    <div data-options="dxTemplate: { name: \'group\' }">\
	      <span class="group-title"><span data-bind="text: key"></span> Playlists</span>\
	    </div>\
	    <div data-bind="css: { \'active-playlist\': id == $root.music.activePlaylist().id }" class="fw-list-title" data-options="dxTemplate: { name: \'item\' }">\
	      <span class="fw-list-count"><span data-bind="text: $root.music.Playlist[id].count">0</span> Beats</span><i class="fwicon-music"></i> <span data-bind="text: title"></span>\
	    </div>\
	  </div>\
	';
            },
            init: function (template, widget, settings) {

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});
                template.adjustSize(template, widget, settings);

            },
            adjustSize: function (template, widget, settings) {
                if (settings.scroll) widget.bbflex('antiscroll');
            }

        },

        licensing: {

            settings: {
                scroll: false
            },

            html: function (template, settings) {
                return '\
	<div class="fw-buynow-licenses nowplaying-licenses" data-bind="dxList: { dataSource: nowplaying().licensing.options, scrollingEnabled: false, itemClickAction: function(action){ window[myAppNamespace].Music.showLicense(action.itemData); }, noDataText: \'No Licensing Options Available\' }">\
	  <div class="fw-buynow-license" data-options="dxTemplate: { name: \'item\' }">\
	    <i class="fw-buynow-license-icon icon-tag"></i>\
	    <div class="fw-buynow-addtocart"><i class="fwicon-forward"></i> View Details</div>\
	    <div class="fw-buynow-license-name" data-bind="text: name"></div>\
	    <div class="fw-buynow-license-price"><span data-bind="text: price"></span></div>\
	  </div>\
	</div>\
	';
            },
            init: function (template, widget, settings) {

                if (settings.width)  widget.css({width: settings.width});
                if (settings.height) widget.css({height: settings.height});
                template.adjustSize(template, widget, settings);

            },
            adjustSize: function (template, widget, settings) {
                if (settings.scroll) widget.bbflex('antiscroll');
            }

        }
    };

})(jQuery);