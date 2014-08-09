/**
 * Monkey Patch:
 * Override a core phonejs method to support our implementation of a multi-mode viewport
 */
(function ($, DX) {

    DX.ui.initViewport = function (options) {
        options = $.extend({}, options);
        var inFrame = top != self;
        var device = DX.devices.fromUA();
        var allowZoom = options.allowZoom,
            allowPan = options.allowPan;
        var metaSelector = "meta[name=viewport]";
        if (!$(metaSelector).length)
            $("<meta />").attr("name", "viewport").appendTo("head");
        var metaVerbs = ["width=device-width"],
            msTouchVerbs = [];
        if (allowZoom)
            msTouchVerbs.push("pinch-zoom");
        else
            metaVerbs.push("initial-scale=1.0", "maximum-scale=1.0");
        if (allowPan)
            msTouchVerbs.push("pan-x", "pan-y");
        if (!allowPan && !allowZoom)
            $("html, body").css("overflow", "hidden");
        else
            $("html").css("-ms-overflow-style", "-ms-autohiding-scrollbar");
        $(metaSelector).attr("content", metaVerbs.join());
        $("html").css("-ms-touch-action", msTouchVerbs.join(" ") || "none");
        if (DX.support.touch)
            $(document).off(".dxInitViewport").on("touchmove.dxInitViewport", function (e) {
                var count = e.originalEvent.touches.length,
                    zoomDisabled = !allowZoom && count > 1,
                    panDisabled = !allowPan && count === 1 && !e.originalEvent.isScrollingEvent;
                if (zoomDisabled || panDisabled)
                    e.preventDefault()
            });
        if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
            $(document.head).append($("<style/>").text("@-ms-viewport{ width:auto!important; user-zoom: fixed; max-zoom: 1; min-zoom: 1; }"));
            $(window).bind("load resize", function (e) {
                var TOP_BAR_W = 44,
                    TOP_BAR_H = 21,
                    ADDRESS_BAR_H = 72;
                var isStandalone = 'Notify' in window.external;
                var barWidth = isStandalone ? TOP_BAR_W : 0,
                    barHeight = isStandalone ? TOP_BAR_H : ADDRESS_BAR_H;
                var actualHeight = $(window).width() < $(window).height() ? Math.round(screen.availHeight * (document.body.clientWidth / screen.availWidth)) - barHeight : Math.round(screen.availWidth * (document.body.clientHeight / screen.availHeight)) - barWidth;
                document.body.style.setProperty("min-height", actualHeight + "px", "important")
            })
        }
        var hideAddressBar = function () {
            var ADDRESS_BAR_HEIGHT = 60,
                isIphone = device.phone,
                isSafari = !navigator.standalone && /safari/i.test(navigator.userAgent);
            var doHide = function () {
                window.scrollTo(0, 1);
            };
            var isInput = function ($who) {
                return $who.is(":input")
            };
            return function (e) {
                var height,
                    $target = $(e.target),
                    $active = $(document.activeElement),
                    isTouch = e.type === "touchstart";
                if (isTouch) {
                    if (isInput($target))
                        return;
                    if (isInput($active))
                        $active.blur()
                }
                else if (isInput($active))
                    return;
                if (isIphone && isSafari) {
                    height = $(window).height() + ADDRESS_BAR_HEIGHT;
                    if ($(document.body).height() !== height)
                        $(document.body).height(height)
                }
                doHide()
            }
        }();
        if (!inFrame && device.ios && DX.devices.iosVersion()[0] < 7) {

            // and the whole point of the patch... refocus our effort to hide the address bar to just the mobile viewport
            $(function () {
                $("body").on("touchstart", '.dx-viewport', hideAddressBar);
            });

        }
    };

})(jQuery, DevExpress);


/**
 * Initialize our namespace
 */
var flexStore = flexStore || {};

(function ($, myApp) {

    myApp.Data = myApp.Data || {};
    myApp.on = $.appflow.bind;
    myApp.trigger = $.appflow.trigger;
    myApp.sequence = $.appflow.sequence;

    myApp.dataDomain = myApp.dataDomain || '//www.beatbrokerz.com';
    myApp.dataURL = myApp.dataURL || '/flexstore/get';
    myApp.postDomain = myApp.postDomain || '';
    myApp.postPath = myApp.postPath || '';
    myApp.checkoutURL = myApp.checkoutURL || 'https://api.beatbrokerz.com/cart/checkout';

    var session_id = $.cookie('_FSID') || undefined;
    if (session_id) {
        myApp.session_id = session_id;
    }

    /** App is launched here by our loader. **/
    myApp.launch = function (complete) {

        complete = complete || function () {
        };

        (function () {

            if (myApp.app) {
                return;
            }

            myApp.trigger('bbflex-app-prelaunch');

            if (!$('.dx-viewport').length) {
                $('body').wrapInner('<div class="bbflex-page-body">').append('<div class="dx-viewport"></div>');
            }

            // monitor page orientation for layout purposes
            $(window).resize(function () {
                if ($(window).width() < $(window).height()) {
                    $('.dx-viewport').removeClass('landscape').addClass('portrait');
                }
                else {
                    $('.dx-viewport').removeClass('portrait').addClass('landscape');
                }
            }).resize();

            myApp.app = new DevExpress.framework.html.HtmlApplication({
                namespace: myApp,
                disableViewCache: myApp.disableViewCache || true,
                defaultLayout: myApp.defaultLayout || "slideout",
                navigation: myApp.navigation,
                commandMapping: myApp.commandMapping,
                viewPort: { allowZoom: true, allowPan: true }
            });

            // View Shown Handler: Analytics, Messaging, etc.
            myApp.app.viewShown.add(function (args) {

                var viewModel = args.viewInfo.model;
                myApp.app.navigated = true;

                // analytics
                //myApp.trackPageView({ affiliate: myApp.appSettings.acct_id, channel: myApp.appSettings.app_name });

                // messaging
                if (myApp.Data.msgQue) {
                    myApp.showMessages(myApp.Data.msgQue);
                    delete myApp.Data.msgQue;
                }

            });

            var devices = DevExpress.devices;
            if (devices.current().platform === "ios") {
                // turn on ios7 theme
                if (devices.iosVersion && ((devices.iosVersion() && devices.iosVersion()[0] === 7) || (window.self != window.top && devices.current().tablet))) {
                    $(".dx-viewport").removeClass("dx-theme-ios").addClass("dx-theme-ios7");
                }
            }

            // register the url routers for our app
            for (i = 0; i < myApp.routers.length; i++) {
                var menu = myApp.routers[i];
                myApp.app.router.register(menu.path, menu.router);
            }

            // load any widgets from the loading queue before we initialize
            $.each(flexloader.data.widgets || [], function (i, widget) {
                $.extend($.bbflex.widgets, widget);
            });
            flexloader.data.widgets = [];

            // load any templates from the loading queue before we navigate
            myApp.app.navigating.add(function (e) {
                if (flexloader.data.templates && flexloader.data.templates.length) {
                    $.each(flexloader.data.templates, function (i, template) {
                        myApp.app.viewEngine._loadTemplatesFromMarkup($('<div>').html(template));
                    });
                    flexloader.data.templates = [];
                }
            });

            // Initialize the store
            myApp.refreshData({ data: 'all' }, function (data) {

                myApp.trigger('bbflex-app-launching', data);

                // Process Playlists
                for (var i in data.playlists) {
                    var playlist = myApp.Music.playlists[i];
                    if (playlist.source == 'ajax') {
                        if (playlist.isDefault) {
                            myApp.Music.usePlaylist(playlist.id);
                            playlist.selectOnLoad = true;
                        }
                        playlist.dataSource = myApp.Datasource.create(myApp.appSettings.app_id, playlist);
                        myApp.Datasource.reload(playlist);
                    }
                }

                // fire up our widgets on the page
                $.bbflex.init();

                // trigger any launch callback
                complete();

                myApp.initialized = true;
                myApp.trigger('bbflex-app-launched', data);

            });

        })();

    };

    /**
     * Command Mapping
     */

    myApp.commandMapping = {};
    $.each(['ios-header-toolbar', 'android-header-toolbar', 'win8-phone-appbar', 'tizen-header-toolbar', 'generic-header-toolbar', 'desktop-toolbar'],
        function (index, commandContainer) {
            myApp.commandMapping[commandContainer] = {
                commands: [
                    { id: 'login', align: 'right', showText: false },
                    { id: 'account', align: 'right', showText: false },
                    { id: 'nowplaying', align: 'right', showText: false },
                    { id: 'checkout', align: 'right', showText: false },
                    { id: 'cart', align: 'right', showText: false },
                    { id: 'filters', align: 'right', showText: false },
                    { id: 'info', align: 'right', showText: false },
                    { id: 'close', align: 'right', showText: false }
                ]
            };
        }
    );


    /**
     * URL Routers
     */
    myApp.routers = [

        // Discounts
        { path: "discount/:id", router: { view: 'discount' } },

        // Producers
        { path: "catalog/:account", router: { view: 'catalog' } },

        // Playlists
        { path: "playlist/:key", router: { view: 'playlist', key: undefined } },
        { path: "nowplaying/:tab", router: { view: 'nowplaying', tab: undefined } },

        // Content
        { path: "menu/:cat", router: { view: 'menu', cat: undefined } },
        { path: "content/:cat/:id", router: { view: 'content', cat: undefined, id: undefined } },

        // Generic Catch-All
        { path: ":view", router: { view: 'nowplaying' } }

    ];

    /**
     *  Convenience Functions
     */

    myApp.modal = function (data, options) {
        myApp.modal.current = myApp.trigger('bbflex-modal-open', data, options);
    }

    myApp.modal.close = function () {
        myApp.trigger('bbflex-modal-close', myApp.modal.current);
    }

    myApp.refreshData = function (request, callback) {

        var requestData = request.data instanceof Array ? request.data.join(',') : request.data;
        var asyncmode = typeof request.wait !== 'undefined' ? !request.wait : true;
        asyncmode = true;

        myApp.ajax({
            url: myApp.dataDomain + myApp.dataURL,
            data: { data: requestData },
            async: asyncmode,
            success: function (result) {

                $.extend(myApp.Data, result);

                // trigger the passed callback, if any
                if (typeof callback == 'function') {
                    callback(result);
                }

            }
        });

    };

    // A wrapper for ajax requests in our app
    myApp.ajax = function (params) {

        // save and clear any success callback since we have our own
        var callback = params.success || function () {
        };
        delete params.success;

        // add the app id to our request
        params.data = params.data || {};
        params.data.app_id = myApp.appSettings.app_id;

        myApp.trigger('bbflex-ajax-working', params);

        if (session_id) {
            params.data['_fsid'] = session_id;
        }

        var settings = {
            url: myApp.dataDomain + myApp.dataURL,
            dataType: "jsonp",
            success: function (result) {

                /* Automated Processing */

                // work around session management for blocked cookies :(
                if (result.session) {
                    if (result.session.storage) {
                        $.cookie('_FSID', result.session.storage.id, { expires: 30, path: '/' });
                        session_id = result.session.storage.id;
                        myApp.session_id = session_id;
                    }
                    else if (result.session.established) {
                        $.removeCookie('_FSID');
                        session_id = undefined;
                        delete myApp.session_id;
                    }
                }

                // process playlist data
                if (result.playlists) {
                    $.each(result.playlists, function (id, playlist) {
                        myApp.Music.resetPlaylist($.extend({}, playlist));
                        $.each(playlist.media, function (i, media) {
                            myApp.Music.addToPlaylist(playlist.id, media);
                        });
                        if (typeof playlist.total_count !== 'undefined') {
                            myApp.Music.Playlist[playlist.id].count(playlist.total_count);
                        }
                    });
                }

                // update any cart information
                if (result.cart) {
                    myApp.Cart.data(result.cart);
                }

                // add any producer profiles
                if (result.Producers) {
                    $.each(result.Producers, function (uid, producer) {
                        var producers = myApp.Producers.byId();
                        if (!producers[uid]) {
                            producers[uid] = producer;
                            myApp.Producers.byId(producers);
                            myApp.Producers.list.push(producer);
                            if (producer.discounts.length) {
                                $.each(producer.discounts, function (i, discount) {
                                    var discounts = myApp.Discounts.byId();
                                    if (!discounts[discount.id]) {
                                        discounts[discount.id] = discount;
                                        myApp.Discounts.byId(discounts);
                                        myApp.Discounts.list.push(discount);
                                    }
                                });
                            }
                        }
                    });
                }

                // execute the calling handler
                callback(result);

                // execute any other registered handlers
                myApp.trigger('bbflex-ajax-complete', params, result);

                myApp.showMessages(result.messages);

            }
        };

        $.extend(settings, params);
        $.ajax(settings);

    };

    myApp.showMessages = function (messages, delay) {
        if (messages) {
            delay = delay || 0;
            var messageDelay = 3000;
            alertify.set({ delay: messageDelay });
            $.each(messages, function (type, message) {
                type = type == 'status' ? 'info' : type;
                setTimeout(function () {
                    if (myApp.Data.fullscreen) {
                        DevExpress.ui.notify(message.join(', '), type, messageDelay);
                    }
                    else {
                        switch (type) {
                            case 'error':
                            case 'warning':
                                alertify.error(message.join(', '));
                                break;
                            case 'success':
                                alertify.success(message.join(', '));
                                break;
                            default:
                                alertify.log(message.join(', '));
                        }
                    }
                }, delay);
                delay += messageDelay;
            });
        }
    }


    /* Abstraction layer for the PhoneJS Datasource object */
    myApp.Datasource = {

        reload: function (playlist, options) {
            if (playlist.dataSource) {
                var DataSource = playlist.dataSource;
                if (typeof DataSource.reload === 'function') {
                    DataSource.reload(options);
                }
                else {
                    DataSource.load($.extend({ refresh: true }, options));
                }
            }
        },

        create: function (app_id, playlist, viewModel) {

            var viewModel = viewModel || {};

            return DevExpress.data.createDataSource({
                load: function (loadOptions) {

                    var myPlaylist = playlist.id;

                    // start loading new, or attempt to get the next page
                    if (loadOptions.refresh) {
                        myApp.Music.resetPlaylist(playlist);
                        viewModel.page = 0;
                    }
                    else {
                        viewModel.page++;
                    }

                    // bail out if we know there is nothing more to load
                    if (viewModel.page &&
                        ((playlist.maxsize && (playlist.loadsize + ((viewModel.page - 1) * playlist.pagesize)) + 1 > viewModel.count) || myApp.Music.playlists[playlist.id].media.length >= viewModel.count)
                        ) {
                        myApp.trigger('bbflex-playlist-outofdata', playlist);
                        return [];
                    }

                    // setup our request parameters
                    var reqParams = {
                        app_id: myApp.appSettings.app_id,
                        music: playlist.id,
                        page: viewModel.page
                    }
                    if (viewModel.filterTitle && viewModel.filterTitle()) {
                        reqParams.title = viewModel.filterTitle();
                        if (viewModel.filterLoadPanel) {
                            viewModel.filterLoadPanel.visible(true);
                        }
                    }

                    var deferred = new $.Deferred();
                    myApp.ajax({
                        data: reqParams,
                        success: function (list) {
                            if (typeof list !== 'object' || list.total_count < 1) {
                                myApp.trigger('bbflex-playlist-outofdata', playlist);
                                deferred.resolve([]);
                                return;
                            }
                            viewModel.count = list.total_count;
                            var beats = $.map(list.items || [], function (item) {
                                var beat = item.beat;

                                // add beats into our playlist
                                beat.playlist = myPlaylist;
                                beat.playlistIndex = myApp.Music.addToPlaylist(myPlaylist, beat);

                                return beat;

                            });
                            myApp.Music.Playlist[myPlaylist].count(list.total_count);
                            deferred.resolve(beats);

                            if (loadOptions.refresh) {
                                if (playlist.selectOnLoad) {
                                    delete playlist.selectOnLoad;
                                    myApp.Music.usePlaylist(myPlaylist, true);
                                    if (myApp.Music.playlists[myPlaylist].media[0]) {
                                        myApp.Music.selectMedia(myApp.Music.playlists[myPlaylist].media[0]);
                                    }
                                }
                                if (playlist.autoplay) {
                                    myApp.Music.playMedia(myApp.Music.playlists[myPlaylist].media[0]);
                                }
                            }

                        }
                    });
                    return deferred;

                }
            });
        }

    };

    /* Abstraction Layer for PhoneJS Devices */
    myApp.device = DevExpress.devices.current();

    myApp.fullScreen = function (view) {
        if (myApp.appSettings.bootmode == 'disabled') {
            console.log('fullscreen disabled');
            return;
        }
        myApp.Data.fullscreen = true;
        if (view && view.fwViewModel) view = undefined; // allow direct ko bindings
        view = view || (myApp.app.navigated ? undefined : (myApp.Music.playing() ? 'nowplaying' : 'home'));
        myApp.trigger('bbflex-fullscreen-opened', view);
        $('.bbflex-page-body').css('display', 'none');
        $('.dx-viewport').addClass('fullscreen');
        if (view) myApp.app.navigate(view);
    }

    myApp.closeApp = function () {
        myApp.Data.fullscreen = false;
        $('.dx-viewport').removeClass('fullscreen');
        $('.bbflex-page-body').css('display', '');
        myApp.trigger('bbflex-fullscreen-closed');
    }

    myApp.receiveMessage = function (message) {
        myApp.trigger('message-received', message);
    }

    window.addEventListener("message", myApp.receiveMessage, false);


    /**
     *  Music Player Interface
     */
    myApp.Music = {

        /* Storage & Reference */
        playlists: {},
        currentPlaylist: '',

        /* Observables */
        seekPosition: ko.observable(0),
        paused: ko.observable(true),
        volume: ko.observable($.bbflex.config.jplayer.volume),
        muted: ko.observable(false),
        nowplaying: ko.observable({ title: '', artist: '', image: '', genres: '', licensing: { options: [] } }), // currently selected song
        Playlist: {}, // gets populated with specific observable data for every playlist by id
        activePlaylist: ko.observable({ title: '', category: '', description: '', producers: [], media: [] }), // an observable of the current playlist object
        activePlaylistItems: ko.observableArray([]), // an observable of the current playlist media
        playlistKeys: ko.observableArray([]), // an observable of all playlist ids
        groupedPlaylists: ko.observable([]), // an observable list of all playlists grouped by category

        /*
         *  Methods
         */

        showLicense: function (license) {
            if (myApp.Data.fullscreen) return;
            myApp.trigger('bbflex-show-license', license);
        },

        showLicenseOptions: function (media) {
            if (myApp.Data.fullscreen) return;
            if (media && media.fwViewModel) media = undefined; // allow direct ko bindings
            media = media || myApp.Music.nowplaying();
            myApp.trigger('bbflex-show-license-options', media);
        },

        showPlaylists: function () {
            if (myApp.Data.fullscreen) return;
            myApp.trigger('bbflex-playlists-show');
        },

        createPlaylist: function (playlist) {
            if (!playlist) return;
            myApp.trigger('bbflex-playlist-creating', playlist);
            myApp.Music.resetPlaylist(playlist);
        },

        resetPlaylist: function (playlist) {
            if (!playlist) return;
            // if a string was passed in, turn it into a rudmentary playlist object
            if (typeof playlist == 'string') {
                playlist = { id: playlist, title: playlist };
            }

            // no id? no go...
            if (!playlist.id) {
                console.log('The playlist must have a valid id');
                return;
            }

            // dereference and default the playlist structure
            myApp.Music.playlists[playlist.id] = {
                id: playlist.id,
                title: '',
                media: [],
                category: 'General',
                description: '',
                producers: [],
                type: 'dynamic'
            };

            // reset current playlist observable if needed
            if (myApp.Music.currentPlaylist == playlist.id) {
                myApp.Music.activePlaylistItems.removeAll();
            }

            // extend the playlist with any old playlist data
            playlist.media = [];
            $.extend(myApp.Music.playlists[playlist.id], playlist);

            if (typeof myApp.Music.Playlist[playlist.id] === 'undefined') {
                myApp.Music.Playlist[playlist.id] = ko.observableArray([]);
                myApp.Music.Playlist[playlist.id].nowplaying = ko.observable({});
                myApp.Music.Playlist[playlist.id].count = ko.observable(0);
                myApp.Music.playlistKeys.push(playlist.id);
            }
            else {
                myApp.Music.Playlist[playlist.id].removeAll();
                myApp.Music.Playlist[playlist.id].nowplaying({});
                myApp.Music.Playlist[playlist.id].count(0);
            }
            myApp.trigger('bbflex-playlist-reset', playlist.id);
        },

        addToPlaylist: function (id, media) {

            // create the playlist if it doesn't exist
            if (typeof myApp.Music.playlists[id] === 'undefined') {
                myApp.Music.resetPlaylist({ id: id, title: id });
            }

            // add the beat to our playlist
            myApp.Music.playlists[id].media.push(media);
            myApp.Music.Playlist[id].push(media);

            // also, add the beat to the active playlist if we're using it
            if (myApp.Music.currentPlaylist == id) {
                myApp.Music.Player.add(media);
                myApp.Music.activePlaylistItems.push(media);
            }

            var playlistIndex = myApp.Music.playlists[id].media.length - 1;
            myApp.trigger('bbflex-playlist-updated', id, media, playlistIndex);

            // send back a reference to the index we just added
            return playlistIndex;

        },

        playMedia: function (media) {

            if (!media.nid) {
                console.log('You can only play beat objects or cart items!');
                return;
            }

            // always play new media using our multipurpose internal player
            myApp.Music.Core = $.bbflex.core;
            myApp.Music.Player = $.bbflex.player;

            // convert shopping cart object into approprate beat object
            if (media.cart_item_id) {
                var beat = myApp.Music.Playlist.cart()[media.playlistIndex];
                media = beat;
            }

            // if this beat isn't already now playing, load and go!
            if (myApp.Music.notSelected(media)) {
                myApp.Music.selectMedia(media);
            }

            myApp.Music.play();

        },

        selectMedia: function (media) {
            if (myApp.Music.notSelected(media)) {
                myApp.Music.usePlaylist(media.playlist);
                myApp.Music.Player.select(media.playlistIndex);
                myApp.trigger('bbflex-nowplaying', media);
            }
        },

        isSelected: function (media) {
            return (
                myApp.Music.nowplaying() &&
                    media.playlist == myApp.Music.currentPlaylist &&
                    myApp.Music.nowplaying().playlistIndex == media.playlistIndex
                );
        },

        notSelected: function (media) {
            return !myApp.Music.isSelected(media);
        },

        // used to make sure that we're on the right playlist
        usePlaylist: function (id, forced) {
            if (!id) return;

            // if this isn't already our active playlist, change the playlist!
            if (myApp.Music.currentPlaylist !== id || forced) {
                /*
                 * We always synchronize the playlist to our internal player
                 * and we check if the internal player exists because we select a
                 * default playlist during launch() before the player is even initialized!
                 */
                myApp.Music.paused(true);
                if ($.bbflex.player) $.bbflex.player.setPlaylist(myApp.Music.playlists[id].media);
                myApp.Music.activePlaylistItems.removeAll();
                $.each(myApp.Music.playlists[id].media, function (i, media) {
                    myApp.Music.activePlaylistItems.push(media);
                });
                myApp.Music.activePlaylist(myApp.Music.playlists[id]);
                myApp.trigger('bbflex-playlist-changed', id);
                myApp.Music.currentPlaylist = id;
            }
        },

        changePlaylist: function (playlist) {
            var id = typeof playlist === 'object' ? playlist.id : playlist;
            if (myApp.Music.currentPlaylist !== id) {
                if (myApp.Music.playlists[id] && myApp.Music.playlists[id].media.length) {
                    myApp.Music.selectMedia(myApp.Music.playlists[id].media[0]);
                }
            }
        },

        playlistLength: function (id) {
            return myApp.Music.playlists[id].media.length;
        },

        addInterface: function (face, options) {

            // extend the jPlayer defaults with any custom options
            options = $.extend({
                cssSelector: {
                    play: ".jp-play",
                    pause: ".jp-pause",
                    previous: ".jp-previous",
                    next: ".jp-next",
                    stop: ".jp-stop",
                    seekBar: ".jp-seek-bar",
                    playBar: ".jp-play-bar",
                    mute: ".jp-mute",
                    unmute: ".jp-unmute",
                    volumeBar: ".jp-volume-bar",
                    volumeBarValue: ".jp-volume-bar-value",
                    volumeMax: ".jp-volume-max",
                    currentTime: ".jp-current-time",
                    duration: ".jp-duration",
                    fullScreen: ".jp-full-screen",
                    repeat: ".jp-repeat",
                    repeatOff: ".jp-repeat-off"
                },
                verticalVolume: false
            }, options);

            var css = options.cssSelector;

            face.find(css.play).click(function () {
                myApp.Music.play();
            });
            face.find(css.pause).click(function () {
                myApp.Music.pause();
            });
            face.find(css.previous).click(function () {
                myApp.Music.playPrevious();
            });
            face.find(css.next).click(function () {
                myApp.Music.playNext();
            });
            face.find(css.mute).click(function () {
                myApp.Music.mute();
            });
            face.find(css.unmute).click(function () {
                myApp.Music.unmute();
            });
            face.find(css.fullScreen).click(function () {
                myApp.fullScreen();
            });
            face.find(css.repeat).click(function() {
                myApp.Music.repeat();
            });
            face.find(css.repeatOff).click(function() {
                myApp.Music.repeatOff();
            });
            face.find(css.playBar + ', ' + css.seekBar).click(function (e) {
                var seekBar = $(this).hasClass(css.playBar.replace('.', '')) ? $(this).closest(css.seekBar) : $(this);
                var offset = seekBar.offset();
                var x = e.pageX - offset.left;
                var w = seekBar.width();
                var p = 100 * x / w;
                myApp.Music.playHead(p);
            });
            face.find(css.volumeBar + ', ' + css.volumeBarValue).click(function (e) {
                var volumeBar = $(this).hasClass(css.volumeBarValue.replace('.', '')) ? $(this).closest(css.volumeBar) : $(this);
                var offset = volumeBar.offset(),
                    x = e.pageX - offset.left,
                    w = volumeBar.width(),
                    y = volumeBar.height() - e.pageY + offset.top,
                    h = volumeBar.height();
                if (options.verticalVolume) {
                    myApp.Music.volume(y / h);
                } else {
                    myApp.Music.volume(x / w);
                }
            });

            myApp.on('bbflex-timeupdate', function (event) {
                // only update the interface if this event is being triggered by our currently active player
                if ($(event.target)[0] === myApp.Music.Core[0]) {
                    face.find(css.duration).html($.jPlayer.convertTime(event.jPlayer.status.duration));
                    face.find(css.currentTime).html($.jPlayer.convertTime(event.jPlayer.status.currentTime));
                    face.find(css.playBar).css('width', event.jPlayer.status.currentPercentAbsolute + '%');
                }
            });

            var syncThisVolume = function (vol) {
                var dim = options.verticalVolume ? 'height' : 'width';
                face.find(css.volumeBarValue).css(dim, (vol * 100) + "%");
            };

            myApp.on('bbflex-volumechange', function (event) {
                var vol = event.jPlayer.options.volume;
                event.jPlayer.options.muted ?
                    face.find(css.volumeBarValue).addClass('muted') && face.find(css.mute).hide() && face.find(css.unmute).show() :
                    face.find(css.volumeBarValue).removeClass('muted') && face.find(css.unmute).hide() && face.find(css.mute).show();
                syncThisVolume(vol);
            });

            myApp.on('bbflex-repeat', function (event) {
               event.jPlayer.options.loop ?
                   face.find(css.repeat).hide() && face.find(css.repeatOff).show() :
                   face.find(css.repeatOff).hide() && face.find(css.repeat).show();
            });

            myApp.Music.playing.subscribe(function (playing) {
                playing ?
                    face.find(css.play).hide() && face.find(css.pause).show() :
                    face.find(css.pause).hide() && face.find(css.play).show();
            });

            // synchronize the initial play/pause buttons state
            myApp.Music.playing() ?
                face.find(css.play).hide() && face.find(css.pause).show() :
                face.find(css.pause).hide() && face.find(css.play).show();

            // synchronize the initial volume level
            syncThisVolume(myApp.Music.volume());

        },

        /*
         *  Music Controls
         */

        play: function (index) {
            if (index && index.fwViewModel) index = undefined; // allow direct ko bindings
            myApp.Music.Player.play(index);
        },

        pause: function () {
            myApp.Music.Player.pause();
        },

        stop: function () {
            myApp.Music.Player.pause();
        },

        playNext: function () {
            myApp.Music.Player.next();
        },

        playPrevious: function () {
            myApp.Music.Player.previous();
        },

        playHead: function (position) {
            myApp.Music.Core.jPlayer('playHead', position);
        },

        mute: function () {
            myApp.Music.Core.jPlayer('mute');
        },
        unmute: function () {
            myApp.Music.Core.jPlayer('unmute');
        },
        repeat: function () {
            myApp.Music.Core.jPlayer('option', 'loop', true);
        },
        repeatOff: function () {
            myApp.Music.Core.jPlayer('option', 'loop', false);
        }

    };

    myApp.Music.playing = ko.computed(function () {
        return !myApp.Music.paused();
    });
    myApp.Music.volume.subscribe(function (vol) {
        myApp.Music.Core.jPlayer("volume", vol);
    });
    myApp.on('bbflex-volumechange', function (event) {
        myApp.Music.muted(event.jPlayer.options.muted);
    });

    myApp.Music.playlistKeys.subscribe(function (id) {
        var listGroups = {};
        $.each(myApp.Music.playlists, function (id, list) {
            if (typeof listGroups[list.category] === 'object') {
                listGroups[list.category].items.push(list);
            }
            else {
                listGroups[list.category] = {
                    key: list.category,
                    items: [ list ]
                };
            }
        });
        var groups = $.map(listGroups, function (group, category) {
            return group;
        });
        myApp.Music.groupedPlaylists(groups);
    });

    // Preload the shopping cart playlist
    myApp.Music.resetPlaylist({ id: 'cart', title: 'Shopping Cart', description: '<p>Beats that are in your shopping cart.</p>' });

    /**
     *   Content Interface
     */
    myApp.Content = {
        prepare: function (appContent, callback) {
            var requested = [];
            var cmap = {};
            callback = callback || function () {
            };
            if (!(appContent instanceof Array)) appContent = [appContent];
            $.each(appContent, function (i, content) {
                if (content.content == undefined) {
                    requested.push(content.contentid);
                    cmap[content.contentid] = {
                        catid: content.catid,
                        index: content.index
                    };
                }
            });
            if (requested.length) {
                myApp.ajax({
                    data: { cid: requested.join(',') },
                    success: function (data) {
                        $.each(data.content, function (i, content) {
                            var ref = cmap[i];
                            myApp.appContent[ref.catid].content[ref.index].content = content || '';
                        });
                        callback();
                    }
                });
            }
            else {
                callback();
            }
        },
        show: function(content) {
            if (!content) { console.log('no content to display'); return; }
            myApp.Content.prepare(content, function() {
                myApp.trigger('bbflex-content-show', content);
            });
        }
    }

    /**
     *   Music Producers Interface
     */
    myApp.Producers = {

        list: ko.observableArray([]),
        byId: ko.observable({})

    };

    /**
     *  Discounts Interface
     */
    myApp.Discounts = {

        list: ko.observableArray([]),
        byId: ko.observable({})

    };


    /**
     *  Shopping Cart Interface
     */
    myApp.Cart = {

        data: ko.observable({ items: [], discounts: { items: [], total: '' }, sub_total: '', total: '', errors: [], messages: [], warnings: [] }),

        add: function (license, func) {
            if (!license) return;
            var callback = typeof func === 'function' ? func : function () {
            };
            var addLink = 'p' + license.nid + '_q1_a1o' + license.option;
            var cartData = myApp.appSettings.app_affiliate ? { href: addLink, _aac: myApp.appSettings.acct_id } : { href: addLink };
            myApp.ajax({
                url: myApp.dataDomain + '/uc_ajax_cart/addlink',
                data: cartData,
                success: function (response) {
                    callback(response);
                    myApp.showMessages({ success: [ $(response).text() ] });
                    myApp.refreshData({ data: 'cart' }, function (data) {
                        myApp.trigger('bbflex-cart-item-added', license, data);
                    });
                }
            });
        },

        remove: function (item, func) {
            if (!item) return;
            var callback = typeof func === 'function' ? func : function () {
            };
            myApp.ajax({
                url: myApp.dataDomain + '/uc_ajax_cart/remove/item',
                data: { nid: item.nid, data: item.data, action: 'remove' },
                success: function (response) {
                    callback(response);
                    myApp.showMessages({ warning: [ $(response).text() ] });
                    myApp.refreshData({ data: 'cart' }, function (data) {
                        myApp.trigger('bbflex-cart-item-removed', item);
                    });
                }
            });
        },

        show: function () {
            myApp.trigger('bbflex-cart-show');
        },
        showCart: function () {
            myApp.Cart.show();
        },

        checkout: function () {
            var cart = myApp.Cart.data();
            if (cart.items && cart.items.length) {
                myApp.trigger('bbflex-checkout-initiated');
            }
            else {
                myApp.showMessages({ warning: [ "No products in your shopping cart!" ] });
            }
        },
        showCheckout: function () {
            myApp.Cart.checkout();
        }

    };

    myApp.Cart.data.subscribe(function (cart) {
        myApp.trigger('bbflex-cart-updated', cart);
    });


    myApp.baseVars = {

        // internal flag
        fwViewModel: true,

        // Computed Shorthands
        nowplaying: ko.computed(function () {
            return myApp.Music.nowplaying();
        }),
        cart: ko.computed(function () {
            return myApp.Cart.data();
        }),

        // Control Variables
        closeVisible: ko.observable(myApp.appSettings.bootmode != 'native'),

        // Convenience References
        music: myApp.Music,
        producers: myApp.Producers,
        discounts: myApp.Discounts,
        content: {
            categories: myApp.appContent,
            prepare: myApp.Content.prepare,
            show: myApp.Content.show
        },
        app: {
            fullScreen: myApp.fullScreen,
            settings: myApp.appSettings,
            content: myApp.appContent
        }

    };

    myApp.baseVars.cart.show = myApp.Cart.show;
    myApp.baseVars.cart.checkout = myApp.Cart.checkout;
    myApp.baseVars.cart.add = myApp.Cart.add;
    myApp.baseVars.cart.remove = myApp.Cart.remove;
    myApp.baseVars.Music = myApp.baseVars.music;

    /**
     * Application Level Event Programming
     */

    /* General Application Events */

    myApp.on('bbflex-initialized', function (bbflex, jPlayer) {
        myApp.Music.Player = bbflex.player;
        myApp.Music.Core = jPlayer;
    });

    myApp.on('bbflex-widget-loading', function (widget) {
        widget.bbflex('applyBindings');
    });

    myApp.on('bbflex-app-launched', function () {
        $('body').addClass('flex-ready');
    });

    myApp.on('bbflex-modal-open', 'render', function (modal) {
        modal = modal || {};
        var dialog = $('#fw-modalDialog').length ? $('#fw-modalDialog') : $('\
      <div id="fw-modalDialog" class="fwbs-modal fade fwmodal" tabindex="-1" role="dialog" aria-labelledby="modalLabel" >\
        <div class="fwbs-modal-dialog">\
          <div class="fwbs-modal-content">\
            <div class="fwbs-modal-header">\
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
              <h2 class="fwbs-modal-title" id="modalLabel"></h2>\
            </div>\
            <div class="fwbs-modal-body"></div>\
            <div class="fwbs-modal-footer"></div>\
          </div>\
        </div>\
      </div>');
        dialog.find('.fwbs-modal-title').empty().append(modal.title);
        dialog.find('.fwbs-modal-body').empty().append(modal.content);
        dialog.find('.fwbs-modal-footer').empty().append(modal.footer);
        dialog.fwmodal();

        return {
            fwinternal: dialog
        };

    });

    myApp.on('bbflex-modal-close', 'render', function (modal) {
        if (modal && modal.fwinternal) {
            modal.fwinternal.fwmodal('hide');
        }
    });

    myApp.on('bbflex-content-show', 'render', function (content) {

        var title = $('<span>').append('<i class="' + content.icon + '"></i> ').append(content.title);
        var body = $('<div>').html(content.content);
        var footer = $('<button type="button" class="btn btn-default close-button">Close</button>').click(function () {
            myApp.modal.close();
        });

        myApp.modal({
            type: 'content',
            title: title,
            content: body,
            footer: footer
        });

    });

    /* Music Events */

    myApp.on('bbflex-nowplaying', 'render', function (media) {
        // if the song has changed, reset our "play tracked" flag
        if (myApp.Music.notSelected(media)) {
            myApp.Data.playTracked = false;
            // load more music if we're on the last song of a dynamic playlist
            var playlist = myApp.Music.playlists[media.playlist];
            myApp.Music.usePlaylist(media.playlist);
            if (playlist.dataSource instanceof Object && playlist.media.length == media.playlistIndex + 1) {
                playlist.dataSource.nextPage();
            }
        }
        myApp.Music.nowplaying(media);
        myApp.Music.Playlist[media.playlist].nowplaying(media);
    });

    myApp.on('bbflex-play', function (event) {
        var media = event.jPlayer.status.media;
        myApp.Music.Core = $(event.target);
        myApp.Music.Player = $(event.target).data('jPlayerPlaylist') || $.bbflex.player;
        if (myApp.Music.notSelected(media)) {
            myApp.trigger('bbflex-nowplaying', media);
        }
        if (!myApp.Data.playTracked) { // track the play if it hasn't been already
            myApp.Data.playTracked = true;
            myApp.trackAction({ nid: media.nid, uid: media.uid, group: 'Engagement', name: 'Plays', label: media.title });
        }
        myApp.Music.paused(false);
    });

    myApp.on('bbflex-pause', function (event) {
        if ($(event.target)[0] === myApp.Music.Core[0]) {
            myApp.Music.paused(true);
        }
    });

    myApp.on('bbflex-timeupdate', function (event) {
        var scrubValue = event.jPlayer.status.currentPercentAbsolute;
        if (!myApp.Data.scrubSliding) {
            myApp.Music.seekPosition(scrubValue);
        }
    });

    myApp.on('bbflex-volumechange', function (event) {
        var volume = event.jPlayer.options.volume;
        $.cookie('_vol', volume, { path: '/' });
    });


    /* Playlist Related Events */

    // -- Listener
    myApp.on('bbflex-playlist-scrolled-bottom', function (id, widget) {
        id = id || myApp.Music.currentPlaylist;
        if (myApp.Music.playlists[id] && myApp.Music.playlists[id].dataSource) {
            myApp.Music.playlists[id].dataSource.nextPage();
        }
    });

    myApp.on('bbflex-playlist-updated', function (id, media, index) {
        if (!myApp.Music.Playlist[id].nowplaying() || !myApp.Music.Playlist[id].nowplaying().nid) {
            myApp.Music.Playlist[id].nowplaying(myApp.Music.Playlist[id]()[0])
        }
    });

    myApp.on('bbflex-playlists-show', 'render', function () {

        var content = $('<div>').bbflex({ widget: 'playlists', theme: 'none' });
        content.find('.fw-playlists').on('click', '.fw-list-title', function () {
            myApp.modal.close();
        });

        var footer = $('<button type="button" class="btn btn-default close-button">Close</button>').click(function () {
            myApp.modal.close();
        });

        myApp.modal({
            type: 'playlists',
            title: '<i class="fwicon-itunes"></i> Playlist Selection',
            content: content,
            footer: footer
        });

    });


    /* Licensing Events */

    myApp.on('bbflex-show-license', 'render', function (license) {
        var cartItem;
        var info;
        if (license.cart_item_id) {
            cartItem = license;
            info = license.license;
        }
        else {
            cartItem = $.map(myApp.Cart.data().items, function (item) {
                return item.nid == license.nid && item.option == license.option ? item : undefined;
            })[0];
            info = license;
        }

        var actionButton = cartItem ?
            '<button id="modalCartRemove" type="button" class="btn btn-danger"><i class="fwicon-trash"></i> Remove From Cart</button>' :
            '<button id="modalCartAdd" type="button" class="btn btn-primary"><i class="fwicon-plus"></i> Add To Cart</button>';

        var content = $('<div>').append('<div class="delivery"><span class="includes">Includes:</span> <span class="files">' + info.files + '</span></div>' + info.terms + '<p>' + info.description + '</p>');

        var footer = $('<div>').append('<button type="button" class="btn btn-default close-button">Close</button>' + actionButton);
        footer.find('#modalCartAdd').click(function () {
            myApp.Cart.add(license);
            myApp.modal.close();
        });
        footer.find('#modalCartRemove').click(function () {
            myApp.Cart.remove(cartItem);
            myApp.modal.close();
        });
        footer.find('.close-button').click(function () {
            myApp.modal.close();
        });

        myApp.modal({
            type: 'license',
            title: info.name + (info.price.indexOf('$') ? ' ' : ' $') + info.price,
            content: content,
            footer: footer
        });

    });

    myApp.on('bbflex-show-license-options', 'render', function (media) {
        media = media || myApp.Music.nowplaying();

        var content = $('<div class="all-licensing-options">').append('\
      <div class="beat-preview clearfix">\
        <img src="' + media.image + '" />\
	<div class="fw-artist">' + media.artist + '</div>\
	<h2 class="fw-songtitle">' + media.title + '</h2>\
	<p class="fw-genres">' + media.genres + '</p>\
      </div>\
      ');
        $.each(media.licensing.options || [], function (i, license) {

            var thiscontent = $('<div class="licensing-option">');

            var cartItem = $.map(myApp.Cart.data().items, function (item) {
                return item.nid == license.nid && item.option == license.option ? item : undefined;
            })[0];

            cartItem ?
                thiscontent.append('<button type="button" class="btn btn-sm btn-danger cart-remove"><i class="fwicon-trash"></i> Remove From Cart</button>') :
                thiscontent.append('<button type="button" class="btn btn-sm btn-primary cart-add"><i class="fwicon-plus"></i> Add To Cart</button>');

            thiscontent.append('\
	  <h3 class="fw-license-title"><i class="fwicon-tag"></i> ' + license.name + ': <strong>' + license.price + '</strong></h3>\
	  ' + '<div class="delivery"><span class="includes">Includes:</span> <span class="files">' + license.files + '</span></div>' + license.terms + '<p>' + license.description + '</p>\
	');

            thiscontent.append('<hr>');

            thiscontent.find('.cart-add').click(function () {
                myApp.Cart.add(license);
                myApp.modal.close();
            });

            thiscontent.find('.cart-remove').click(function () {
                myApp.Cart.remove(cartItem);
                myApp.modal.close();
            });

            content.append(thiscontent);

        });

        var footer = $('<button type="button" class="btn btn-default">Close</button>').click(function () {
            myApp.modal.close();
        });

        myApp.modal({
            type: 'licenseoptions',
            title: '<i class="fwicon-tags"></i> Available Licensing Options',
            content: content,
            footer: footer
        });

    });


    /* Cart Related Events */

    myApp.on('bbflex-checkout-initiated', 'after', function () {
        var cart = myApp.Cart.data();
        if (cart.items && cart.items.length) {
            if (myApp.appSettings.app_affiliate) {
                if (myApp.appSettings.bootmode != 'disabled' && !(myApp.device.tablet || myApp.device.phone)) {
                    myApp.fullScreen('checkout');
                }
                else {
                    myApp.ajax({
                        url: 'https://api.beatbrokerz.com/cart/checkout/session',
                        data: {
                            app_id: myApp.appSettings.app_id,
                            ref: document.location.href.replace(document.location.hash, '')
                        },
                        success: function (result) {
                            var checkout_url = myApp.checkoutURL;
                            if (myApp.session_id) {
                                checkout_url = checkout_url + '?_fsid=' + myApp.session_id;
                            }
                            window.top.location = checkout_url;
                        }
                    });
                }
            }
            else {
                window.top.location = 'https://www.beatbrokerz.com/cart/checkout';
            }
        }
    });

    myApp.on('bbflex-cart-show', 'render', function () {
        var totals = $('<div class="fw-cart-totals-wrap">\
      <div data-bind="text: \'Subtotal: $\' + flexStore.Cart.data().sub_total" class="fw-cart-subtotal"></div>\
      <div data-bind="text: \'Discounts: $\' + flexStore.Cart.data().discounts.total" class="fw-cart-discounts"></div>\
      <div data-bind="text: \'Total: $\' + flexStore.Cart.data().total" class="fw-cart-total"></div>\
    </div>');
        totals.bbflex('applyBindings');
        var footer = $('<div>').append('<button type="button" class="btn btn-default close-button">Close</button><button data-bind="visible: flexStore.Cart.data().items.length > 0" type="button" class="btn btn-success checkout-button"><i class="fwicon-dollar"></i> &nbsp;Checkout</button>');
        footer.find('.close-button').click(function () {
            myApp.modal.close();
        });
        footer.bbflex('applyBindings');

        var content = $('<div>').bbflex({ widget: 'cart', theme: 'none' }).append(totals);

        footer.find('.checkout-button').click(function () {
            myApp.modal.close();
            flexStore.Cart.checkout();
        });

        myApp.modal({
            type: 'cart',
            title: '<i class="fwicon-basket"></i> Shopping Cart',
            content: content,
            footer: footer
        });

    });

    /*
     *  STATS TRACKING
     */

    myApp.trackPageView = function (settings) {
        var page = $.extend({
            channel: 'Flex Store Apps',
            url: location.pathname + location.search + location.hash
        }, settings);
        if (typeof OWATracker !== 'undefined') {
            var nid = page.nid || 0;
            var uid = page.uid || 0;
            var channel = page.channel || '';
            var affiliate = page.affiliate || $.cookie('affiliate[uid]') || 0;
            OWATracker.setCustomVar(1, 'nid', nid, 'page');
            OWATracker.setCustomVar(2, 'uid', uid, 'page');
            OWATracker.setCustomVar(4, 'channel', channel, 'page');
            OWATracker.setCustomVar(5, 'affiliate', affiliate, 'page');
            OWATracker.trackPageView(page.url);
        }
    };

    myApp.trackAction = function (settings) {
        var action = $.extend({
            channel: 'Flex Store Apps',
            group: 'Ungrouped',
            name: 'Unnamed',
            label: 'Unlabelled',
            value: 1
        }, settings);
        if (typeof OWATracker !== 'undefined') {
            var nid = action.nid || 0;
            var uid = action.uid || 0;
            var channel = action.channel || '';
            var affiliate = action.affiliate || $.cookie('affiliate[uid]') || 0;
            OWATracker.setCustomVar(1, 'nid', nid, 'page');
            OWATracker.setCustomVar(2, 'uid', uid, 'page');
            OWATracker.setCustomVar(4, 'channel', channel, 'page');
            OWATracker.setCustomVar(5, 'affiliate', affiliate, 'page');
            OWATracker.trackAction(action.group, action.name, action.label, action.value);
        }
    };

    /**
     * Main Navigation Links
     */
    myApp.navigation = [
        { title: "Home", action: "#home", icon: "home", root: true },
        { title: "Producers", action: "#producers", icon: "user", visible: ko.computed(function () {
            return myApp.Producers.list().length > 0;
        }), root: true },
        { title: "Playlists", action: "#playlists", icon: "menu", root: true },
        { title: "Special Offers", action: "#discounts", icon: "tags", visible: ko.computed(function () {
            return myApp.Discounts.list().length > 0;
        }), root: true },
        { title: "Content", action: "#menu", icon: "doc", visible: myApp.appContent && $.map(myApp.appContent,function () {
            return true;
        }).length > 0, root: true },
        { title: "Now Playing", action: "#nowplaying", icon: "music", root: true },
        { title: "Shopping Cart", action: "#cart", icon: "cart", root: true },
        { title: "Close", action: function () {
            myApp.closeApp();
        }, icon: "close", visible: myApp.baseVars.closeVisible, root: false }
    ];


})(jQuery, flexStore);
