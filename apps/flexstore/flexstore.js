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

(function ($, App) {

    App.Data = App.Data || {};
    App.on = $.appflow.bind;
    App.one = App.once = $.appflow.bindonce;
    App.trigger = $.appflow.trigger;
    App.sequence = $.appflow.sequence;

    App.dataDomain = App.dataDomain || ('https:' == document.location.protocol ? 'https:' : 'http:') + '//www.beatbrokerz.com';
    App.dataURL = App.dataURL || '/flexstore/get';
    App.postDomain = App.postDomain || '';
    App.postPath = App.postPath || '';
    App.checkoutURL = App.checkoutURL || 'https://api.beatbrokerz.com/cart/checkout';

    App.ajaxActive = ko.observable(false);
    App.finalized = false;

    var session_id = $.cookie('_FSID') || undefined;
    if (session_id) {
        App.session_id = session_id;
    }

    /** App is launched here by our loader. **/
    App.launch = function (complete) {

        complete = complete || function () {
        };

        (function () {

            if (App.app) {
                return;
            }

            App.trigger('bbflex-app-prelaunch');

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

            App.app = new DevExpress.framework.html.HtmlApplication({
                namespace: App,
                disableViewCache: App.disableViewCache || true,
                defaultLayout: App.defaultLayout || "slideout",
                navigation: App.navigation,
                commandMapping: App.commandMapping,
                viewPort: { allowZoom: true, allowPan: true }
            });

            // View Shown Handler: Analytics, Messaging, etc.
            App.app.viewShown.add(function (args) {

                var viewModel = args.viewInfo.model;
                App.app.navigated = true;

                // analytics
                //App.trackPageView();

                // messaging
                if (App.Data.msgQue) {
                    App.showMessages(App.Data.msgQue);
                    delete App.Data.msgQue;
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
            for (i = 0; i < App.routers.length; i++) {
                var menu = App.routers[i];
                App.app.router.register(menu.path, menu.router);
            }

            // load any widgets from the loading queue before we initialize
            $.each(flexloader.data.widgets || [], function (i, widget) {
                $.extend($.bbflex.widgets, widget);
            });
            flexloader.data.widgets = [];

            // load any templates from the loading queue before we navigate
            App.app.navigating.add(function (e) {
                if (flexloader.data.templates && flexloader.data.templates.length) {
                    $.each(flexloader.data.templates, function (i, template) {
                        App.app.viewEngine._loadTemplatesFromMarkup($('<div>').html(template));
                    });
                    flexloader.data.templates = [];
                }
            });

            // Initialize the store
            App.refreshData({ data: 'all' }, function (data) {

                App.trigger('bbflex-app-launching', data);

                // fire up our widgets on the page
                $.bbflex.init();

                // trigger any launch callback
                complete();

                App.initialized = true;
                App.trigger('bbflex-app-launched', data);

            });

        })();

    };

    /**
     * Command Mapping
     */

    App.commandMapping = {};
    $.each(['ios-header-toolbar', 'android-header-toolbar', 'win8-phone-appbar', 'tizen-header-toolbar', 'generic-header-toolbar', 'desktop-toolbar'],
        function (index, commandContainer) {
            App.commandMapping[commandContainer] = {
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
    App.routers = [

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

    App.modal = function (data, options) {
        App.modal.current = App.trigger('bbflex-modal-open', data, options);
    }

    App.modal.close = function () {
        App.trigger('bbflex-modal-close', App.modal.current);
    }

    App.refreshData = function (request, callback) {

        var requestData = request.data instanceof Array ? request.data.join(',') : request.data;
        var asyncmode = typeof request.wait !== 'undefined' ? !request.wait : true;
        asyncmode = true;

        App.ajax({
            url: App.dataDomain + App.dataURL,
            data: { data: requestData },
            async: asyncmode,
            success: function (result) {

                $.extend(App.Data, result);

                // trigger the passed callback, if any
                if (typeof callback == 'function') {
                    callback(result);
                }

            }
        });

    };

    var activeAjaxRequests = 0;

    // A wrapper for ajax requests in our app
    App.ajax = function (params) {

        // save and clear any callbacks since we implement our own
        var successCallback = params.success || new Function;
        var errorCallback = params.error || new Function;
        var completeCallback = params.complete || new Function;

        delete params.success;
        delete params.error;
        delete params.complete;

        // add the app id to our request
        params.data = params.data || {};
        params.data.app_id = App.appSettings.app_id;

        if (session_id) {
            params.data['_fsid'] = session_id;
        }

        var settings = {
            url: App.dataDomain + App.dataURL,
            dataType: "jsonp",
            success: function (result, textStatus, jqXHR) {

                /* Automated Processing */

                // work around session management for blocked cookies :(
                if (result.session) {
                    if (result.session.storage) {
                        $.cookie('_FSID', result.session.storage.id, { expires: 30, path: '/' });
                        session_id = result.session.storage.id;
                        App.session_id = session_id;
                    }
                    else if (result.session.established) {
                        $.removeCookie('_FSID');
                        session_id = undefined;
                        delete App.session_id;
                    }
                }

                // process playlist data
                if (result.playlists) {
                    $.each(result.playlists, function (id, playlist) {
                        App.Music.resetPlaylist($.extend({}, playlist));
                        $.each(playlist.media, function (i, media) {
                            App.Music.addToPlaylist(playlist.id, media);
                        });
                        if (typeof playlist.total_count !== 'undefined') {
                            App.Music.Playlist[playlist.id].count(playlist.total_count);
                        }
                        if (playlist.source == 'ajax') {
                            if (playlist.isDefault) {
                                App.Music.usePlaylist(playlist.id);
                                playlist.selectOnLoad = true;
                            }
                            playlist.dataSource = App.Datasource.create(App.appSettings.app_id, playlist);
                            App.Datasource.reload(playlist);
                        }
                    });
                }

                // update any cart information
                if (result.cart) {
                    App.Cart.data(result.cart);
                }

                // add any producer profiles
                if (result.Producers) {
                    $.each(result.Producers, function (uid, producer) {
                        var producers = App.Producers.byId();
                        if (!producers[uid]) {
                            producers[uid] = producer;
                            App.Producers.byId(producers);
                            App.Producers.list.push(producer);
                            if (producer.discounts.length) {
                                $.each(producer.discounts, function (i, discount) {
                                    var discounts = App.Discounts.byId();
                                    if (!discounts[discount.id]) {
                                        discounts[discount.id] = discount;
                                        App.Discounts.byId(discounts);
                                        App.Discounts.list.push(discount);
                                    }
                                });
                            }
                        }
                    });
                }

                // execute the calling handler
                successCallback(result, textStatus, jqXHR);

                // execute any registered 'success' handlers
                App.trigger('bbflex-ajax-success', params, result, textStatus);

                App.showMessages(result.messages);

            },
            error: function(jqXHR, textStatus, errorThrown) {

                errorCallback(jqXHR, textStatus, errorThrown);

                // execute any registered 'error' handlers
                App.trigger('bbflex-ajax-error', params, textStatus, errorThrown);

            },
            complete: function(jqXHR, textStatus) {

                completeCallback(jqXHR, textStatus);

                // execute any registered 'complete' handlers
                App.trigger('bbflex-ajax-complete', params, textStatus);

                if (--activeAjaxRequests == 0) {
                    App.trigger('bbflex-ajax-idle');
                }

            }
        };

        $.extend(settings, params);
        activeAjaxRequests++;
        if (!App.ajaxActive()) {
            App.ajaxActive(true);
            App.trigger('bbflex-ajax-active');
        }
        App.trigger('bbflex-ajax-working', params);

        $.ajax(settings);

    };

    App.once('bbflex-ajax-idle', function() {
        App.finalized = true;
        App.trigger('bbflex-app-final');
        App.trackPageView();
    });

    App.showMessages = function (messages, delay) {
        if (messages) {
            delay = delay || 0;
            var messageDelay = 3000;
            alertify.set({ delay: messageDelay });
            $.each(messages, function (type, message) {
                type = type == 'status' ? 'info' : type;
                setTimeout(function () {
                    if (App.Data.fullscreen) {
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
    App.Datasource = {

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
                        App.Music.resetPlaylist(playlist);
                        viewModel.page = 0;
                    }
                    else {
                        viewModel.page++;
                    }

                    // bail out if we know there is nothing more to load
                    if (viewModel.page &&
                        ((playlist.maxsize && (playlist.loadsize + ((viewModel.page - 1) * playlist.pagesize)) + 1 > viewModel.count) || App.Music.playlists[playlist.id].media.length >= viewModel.count)
                        ) {
                        App.trigger('bbflex-playlist-outofdata', playlist);
                        return [];
                    }

                    // setup our request parameters
                    var reqParams = {
                        app_id: App.appSettings.app_id,
                        music: playlist.id,
                        page: viewModel.page
                    }
                    var params = $.extend(playlist.params, reqParams);

                    var deferred = new $.Deferred();
                    App.ajax({
                        data: params,
                        success: function (list) {
                            if (typeof list !== 'object' || list.total_count < 1 || list.total_count == undefined) {
                                App.trigger('bbflex-playlist-outofdata', playlist);
                                deferred.resolve([]);
                                return;
                            }
                            viewModel.count = list.total_count;
                            var beats = $.map(list.items || [], function (item) {
                                var beat = item.beat;

                                // add beats into our playlist
                                beat.playlist = myPlaylist;
                                beat.playlistIndex = App.Music.addToPlaylist(myPlaylist, beat);

                                return beat;

                            });
                            App.Music.Playlist[myPlaylist].count(list.total_count);
                            deferred.resolve(beats);

                            if (loadOptions.refresh) {
                                if (playlist.selectOnLoad) {
                                    delete playlist.selectOnLoad;
                                    App.Music.usePlaylist(myPlaylist, true);
                                    if (App.Music.playlists[myPlaylist].media[0]) {
                                        App.Music.selectMedia(App.Music.playlists[myPlaylist].media[0]);
                                    }
                                }
                                if (playlist.autoplay) {
                                    App.Music.playMedia(App.Music.playlists[myPlaylist].media[0]);
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
    App.device = DevExpress.devices.current();

    App.fullScreen = function (view) {
        if (App.appSettings.bootmode == 'disabled') {
            console.log('fullscreen disabled');
            return;
        }
        App.Data.fullscreen = true;
        if (view && view.fwViewModel) view = undefined; // allow direct ko bindings
        view = view || (App.app.navigated ? undefined : (App.Music.playing() ? 'nowplaying' : 'home'));
        App.trigger('bbflex-fullscreen-opened', view);
        $('.bbflex-page-body').css('display', 'none');
        $('.dx-viewport').addClass('fullscreen');
        if (view) App.app.navigate(view);
    }

    App.closeApp = function () {
        App.Data.fullscreen = false;
        $('.dx-viewport').removeClass('fullscreen');
        $('.bbflex-page-body').css('display', '');
        App.trigger('bbflex-fullscreen-closed');
    }

    App.receiveMessage = function (message) {
        App.trigger('message-received', message);
    }

    App.showContact = function (config) {
        App.trigger('bbflex-show-contact', config);
    }

    window.addEventListener("message", App.receiveMessage, false);


    /**
     *  Music Player Interface
     */
    App.Music = {

        /* Storage & Reference */
        playlists: {},
        currentPlaylist: '',

        /* Observables */
        seekPosition: ko.observable(0),
        paused: ko.observable(true),
        volume: ko.observable($.bbflex.config.jplayer.volume),
        muted: ko.observable(false),
        nowplaying: ko.observable({ // currently selected song
            title: '',
            artist: '',
            image: 'https://www.beatbrokerz.com/flex/images/blank250x250.png',
            thumbnail: 'https://www.beatbrokerz.com/flex/images/blank50x50.png',
            genres: '',
            licensing: { options: [] },
            attributes: {},
            description: '',
            tempo: '', effects: '', genres: '', hook: '', instruments: '', moods: '',
            ratings: { average: 0, total: 0 },
            tags: []
        }),
        Playlist: {}, // gets populated with specific observable data for every playlist by id
        activePlaylist: ko.observable({ // an observable of the current playlist object
            id: 'init',
            title: '',
            category: '',
            description: '',
            producers: [],
            media: []
        }),
        activePlaylistItems: ko.observableArray([]), // an observable of the current playlist media
        playlistKeys: ko.observableArray([]), // an observable of all playlist ids
        groupedPlaylists: ko.observable([]), // an observable list of all playlists grouped by category

        search: ko.observable(''),

        /*
         *  Methods
         */

        loadMore: function (playlist) {
            switch (typeof playlist) {
                case 'object' :
                    id = playlist.id;
                    break;
                case 'string' :
                    id = playlist;
                    break;
                default:
                    id = App.Music.currentPlaylist;
            }
            if (App.Music.playlists[id] && App.Music.playlists[id].dataSource) {
                App.Music.playlists[id].dataSource.nextPage();
            }
        },

        showLicense: function (license) {
            if (App.Data.fullscreen) return;
            App.trigger('bbflex-show-license', license);
        },

        showLicenseOptions: function (media) {
            if (App.Data.fullscreen) return;
            if (media && media.fwViewModel) media = undefined; // allow direct ko bindings
            media = media || App.Music.nowplaying();
            App.trigger('bbflex-show-license-options', media);
        },

        showPlaylist: function(playlist) {
            if (App.Data.fullscreen) return;
            var id = typeof playlist === 'object' ? playlist.id : playlist;
            App.trigger('bbflex-show-playlist', id);
        },

        showPlaylists: function () {
            if (App.Data.fullscreen) return;
            App.trigger('bbflex-show-playlists');
        },

        showSearch: function () {
            if (App.Data.fullscreen) return;
            App.trigger('bbflex-show-search');
        },

        createPlaylist: function (playlist) {
            if (!playlist) return;
            App.trigger('bbflex-playlist-creating', playlist);
            App.Music.resetPlaylist(playlist);
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
            App.Music.playlists[playlist.id] = {
                id: playlist.id,
                title: '',
                media: [],
                category: 'General',
                description: '',
                producers: [],
                type: 'dynamic'
            };

            // reset current playlist observable if needed
            if (App.Music.currentPlaylist == playlist.id) {
                App.Music.activePlaylistItems.removeAll();
            }

            // extend the playlist with any old playlist data
            playlist.media = [];
            $.extend(App.Music.playlists[playlist.id], playlist);

            if (typeof App.Music.Playlist[playlist.id] === 'undefined') {
                App.Music.Playlist[playlist.id] = ko.observableArray([]);
                App.Music.Playlist[playlist.id].nowplaying = ko.observable({});
                App.Music.Playlist[playlist.id].count = ko.observable(0);
                App.Music.playlistKeys.push(playlist.id);
            }
            else {
                App.Music.Playlist[playlist.id].removeAll();
                App.Music.Playlist[playlist.id].nowplaying({});
                App.Music.Playlist[playlist.id].count(0);
            }
            App.trigger('bbflex-playlist-reset', playlist.id);
        },

        addToPlaylist: function (id, media) {

            // create the playlist if it doesn't exist
            if (typeof App.Music.playlists[id] === 'undefined') {
                App.Music.resetPlaylist({ id: id, title: id });
            }

            // add the beat to our playlist
            App.Music.playlists[id].media.push(media);
            App.Music.Playlist[id].push(media);

            // also, add the beat to the active playlist if we're using it
            if (App.Music.currentPlaylist == id) {
                App.Music.Player.add(media);
                App.Music.activePlaylistItems.push(media);
            }

            var playlistIndex = App.Music.playlists[id].media.length - 1;
            App.trigger('bbflex-playlist-updated', id, media, playlistIndex);

            // send back a reference to the index we just added
            return playlistIndex;

        },

        playMedia: function (media) {

            if (!media.nid) {
                console.log('You can only play beat objects or cart items!');
                return;
            }

            // always play new media using our multipurpose internal player
            App.Music.Core = $.bbflex.core;
            App.Music.Player = $.bbflex.player;

            // convert shopping cart object into approprate beat object
            if (media.cart_item_id) {
                var beat = App.Music.Playlist.cart()[media.playlistIndex];
                media = beat;
            }

            // if this beat isn't already now playing, load and go!
            if (App.Music.notSelected(media)) {
                App.Music.selectMedia(media);
            }

            App.Music.play();

        },

        selectMedia: function (media) {
            if (App.Music.notSelected(media)) {
                App.Music.usePlaylist(media.playlist);
                App.Music.Player.select(media.playlistIndex);
                App.trigger('bbflex-nowplaying', media);
            }
        },

        isSelected: function (media) {
            return (
                App.Music.nowplaying() &&
                    media.playlist == App.Music.currentPlaylist &&
                    App.Music.nowplaying().playlistIndex == media.playlistIndex
                );
        },

        notSelected: function (media) {
            return !App.Music.isSelected(media);
        },

        // used to make sure that we're on the right playlist
        usePlaylist: function (id, forced) {
            if (!id) return;

            // if this isn't already our active playlist, change the playlist!
            if (App.Music.currentPlaylist !== id || forced) {
                /*
                 * We always synchronize the playlist to our internal player
                 * and we check if the internal player exists because we select a
                 * default playlist during launch() before the player is even initialized!
                 */
                App.Music.paused(true);
                if ($.bbflex.player) $.bbflex.player.setPlaylist(App.Music.playlists[id].media);
                App.Music.activePlaylistItems.removeAll();
                $.each(App.Music.playlists[id].media, function (i, media) {
                    App.Music.activePlaylistItems.push(media);
                });
                App.Music.activePlaylist(App.Music.playlists[id]);
                App.trigger('bbflex-playlist-changed', id);
                App.Music.currentPlaylist = id;
            }
        },

        changePlaylist: function (playlist) {
            var id = typeof playlist === 'object' ? playlist.id : playlist;
            if (App.Music.currentPlaylist !== id) {
                if (App.Music.playlists[id] && App.Music.playlists[id].media.length) {
                    App.Music.selectMedia(App.Music.playlists[id].media[0]);
                }
            }
        },

        playlistLength: function (id) {
            return App.Music.playlists[id].media.length;
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
                App.Music.play();
            });
            face.find(css.pause).click(function () {
                App.Music.pause();
            });
            face.find(css.previous).click(function () {
                App.Music.playPrevious();
            });
            face.find(css.next).click(function () {
                App.Music.playNext();
            });
            face.find(css.mute).click(function () {
                App.Music.mute();
            });
            face.find(css.unmute).click(function () {
                App.Music.unmute();
            });
            face.find(css.fullScreen).click(function () {
                App.fullScreen();
            });
            face.find(css.repeat).click(function() {
                App.Music.repeat();
            });
            face.find(css.repeatOff).click(function() {
                App.Music.repeatOff();
            });
            face.find(css.playBar + ', ' + css.seekBar).click(function (e) {
                var seekBar = $(this).hasClass(css.playBar.replace('.', '')) ? $(this).closest(css.seekBar) : $(this);
                var offset = seekBar.offset();
                var x = e.pageX - offset.left;
                var w = seekBar.width();
                var p = 100 * x / w;
                App.Music.playHead(p);
            });
            face.find(css.volumeBar + ', ' + css.volumeBarValue).click(function (e) {
                var volumeBar = $(this).hasClass(css.volumeBarValue.replace('.', '')) ? $(this).closest(css.volumeBar) : $(this);
                var offset = volumeBar.offset(),
                    x = e.pageX - offset.left,
                    w = volumeBar.width(),
                    y = volumeBar.height() - e.pageY + offset.top,
                    h = volumeBar.height();
                if (options.verticalVolume) {
                    App.Music.volume(y / h);
                } else {
                    App.Music.volume(x / w);
                }
            });

            App.on('bbflex-timeupdate', function (event) {
                // only update the interface if this event is being triggered by our currently active player
                if ($(event.target)[0] === App.Music.Core[0]) {
                    face.find(css.duration).html($.jPlayer.convertTime(event.jPlayer.status.duration));
                    face.find(css.currentTime).html($.jPlayer.convertTime(event.jPlayer.status.currentTime));
                    face.find(css.playBar).css('width', event.jPlayer.status.currentPercentAbsolute + '%');
                }
            });

            var syncThisVolume = function (vol) {
                var dim = options.verticalVolume ? 'height' : 'width';
                face.find(css.volumeBarValue).css(dim, (vol * 100) + "%");
            };

            App.on('bbflex-volumechange', function (event) {
                var vol = event.jPlayer.options.volume;
                event.jPlayer.options.muted ?
                    face.find(css.volumeBarValue).addClass('muted') && face.find(css.mute).hide() && face.find(css.unmute).show() :
                    face.find(css.volumeBarValue).removeClass('muted') && face.find(css.unmute).hide() && face.find(css.mute).show();
                syncThisVolume(vol);
            });

            App.on('bbflex-repeat', function (event) {
               event.jPlayer.options.loop ?
                   face.find(css.repeat).hide() && face.find(css.repeatOff).show() :
                   face.find(css.repeatOff).hide() && face.find(css.repeat).show();
            });

            App.Music.playing.subscribe(function (playing) {
                playing ?
                    face.find(css.play).hide() && face.find(css.pause).show() :
                    face.find(css.pause).hide() && face.find(css.play).show();
            });

            // synchronize the initial play/pause buttons state
            App.Music.playing() ?
                face.find(css.play).hide() && face.find(css.pause).show() :
                face.find(css.pause).hide() && face.find(css.play).show();

            // synchronize the initial volume level
            syncThisVolume(App.Music.volume());

        },

        /*
         *  Music Controls
         */

        play: function (index) {
            if (index && index.fwViewModel) index = undefined; // allow direct ko bindings
            App.Music.Player.play(index);
        },

        pause: function () {
            App.Music.Player.pause();
        },

        stop: function () {
            App.Music.Player.pause();
        },

        playNext: function () {
            App.Music.Player.next();
        },

        playPrevious: function () {
            App.Music.Player.previous();
        },

        playHead: function (position) {
            App.Music.Core.jPlayer('playHead', position);
        },

        mute: function () {
            App.Music.Core.jPlayer('mute');
        },
        unmute: function () {
            App.Music.Core.jPlayer('unmute');
        },
        repeat: function () {
            App.Music.Core.jPlayer('option', 'loop', true);
        },
        repeatOff: function () {
            App.Music.Core.jPlayer('option', 'loop', false);
        }

    };

    App.Music.playing = ko.computed(function () {
        return !App.Music.paused();
    });
    App.Music.volume.subscribe(function (vol) {
        App.Music.Core.jPlayer("volume", vol);
    });
    App.on('bbflex-volumechange', function (event) {
        App.Music.muted(event.jPlayer.options.muted);
    });

    App.Music.playlistKeys.subscribe(function (id) {
        var listGroups = {};
        $.each(App.Music.playlists, function (id, list) {
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
        App.Music.groupedPlaylists(groups);
    });

    App.Music.search.subscribe(function(searchString) {
        if (searchString) {
            App.trigger('bbflex-search-starting', searchString);
            App.ajax({
                data: {
                    playlist: 'search',
                    search: searchString
                },
                complete: function() {
                    App.trigger('bbflex-search-complete', searchString);
                }
            });
        }
    });

    // Preload the shopping cart playlist
    App.Music.resetPlaylist({ id: 'cart', title: 'Shopping Cart', description: '<p>Beats that are in your shopping cart.</p>' });

    /**
     *   Content Interface
     */
    App.Content = {
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
                App.ajax({
                    data: { cid: requested.join(',') },
                    success: function (data) {
                        $.each(data.content, function (i, content) {
                            var ref = cmap[i];
                            App.appContent[ref.catid].content[ref.index].content = content || '';
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
            App.Content.prepare(content, function() {
                App.trigger('bbflex-show-content', content);
            });
        }
    }

    /**
     *   Music Producers Interface
     */
    App.Producers = {

        list: ko.observableArray([]),
        byId: ko.observable({})

    };

    /**
     *  Discounts Interface
     */
    App.Discounts = {

        list: ko.observableArray([]),
        byId: ko.observable({})

    };


    /**
     *  Shopping Cart Interface
     */
    App.Cart = {

        data: ko.observable({ items: [], discounts: { items: [], total: '' }, sub_total: '', total: '', errors: [], messages: [], warnings: [] }),

        add: function (license, func) {
            if (!license) return;
            var callback = typeof func === 'function' ? func : function () {
            };
            var addLink = 'p' + license.nid + '_q1_a1o' + license.option;
            var cartData = App.appSettings.app_affiliate ? { href: addLink, _aac: App.appSettings.acct_id } : { href: addLink };
            App.ajax({
                url: App.dataDomain + '/uc_ajax_cart/addlink',
                data: cartData,
                success: function (response) {
                    callback(response);
                    App.showMessages({ success: [ $(response).text() ] });
                    App.refreshData({ data: 'cart' }, function (data) {
                        App.trigger('bbflex-cart-item-added', license, data);
                    });
                }
            });
        },

        remove: function (item, func) {
            if (!item) return;
            var callback = typeof func === 'function' ? func : function () {
            };
            App.ajax({
                url: App.dataDomain + '/uc_ajax_cart/remove/item',
                data: { nid: item.nid, data: item.data, action: 'remove' },
                success: function (response) {
                    callback(response);
                    App.showMessages({ warning: [ $(response).text() ] });
                    App.refreshData({ data: 'cart' }, function (data) {
                        App.trigger('bbflex-cart-item-removed', item);
                    });
                }
            });
        },

        show: function () {
            App.trigger('bbflex-show-cart');
        },
        showCart: function () {
            App.Cart.show();
        },

        checkout: function () {
            var cart = App.Cart.data();
            if (cart.items && cart.items.length) {
                App.trigger('bbflex-checkout-initiated');
            }
            else {
                App.showMessages({ warning: [ "No products in your shopping cart!" ] });
            }
        },
        showCheckout: function () {
            App.Cart.checkout();
        }

    };

    App.Cart.data.subscribe(function (cart) {
        App.trigger('bbflex-cart-updated', cart);
    });


    App.baseVars = {

        // internal flag
        fwViewModel: true,

        // Computed Shorthands
        nowplaying: ko.computed(function () {
            return App.Music.nowplaying();
        }),
        cart: ko.computed(function () {
            return App.Cart.data();
        }),

        // Control Variables
        closeVisible: ko.observable(App.appSettings.bootmode != 'native'),

        // Convenience References
        music: App.Music,
        producers: App.Producers,
        discounts: App.Discounts,
        content: {
            categories: App.appContent,
            prepare: App.Content.prepare,
            show: App.Content.show
        },
        app: {
            fullScreen: App.fullScreen,
            settings: App.appSettings,
            content: App.appContent,
            ajaxActive: App.ajaxActive,
            showContact: App.showContact
        }

    };

    App.baseVars.cart.show = App.Cart.show;
    App.baseVars.cart.checkout = App.Cart.checkout;
    App.baseVars.cart.add = App.Cart.add;
    App.baseVars.cart.remove = App.Cart.remove;
    App.baseVars.Music = App.baseVars.music;

    /**
     * Application Level Event Programming
     */

    /* General Application Events */

    App.on('bbflex-initialized', function (bbflex, jPlayer) {
        App.Music.Player = bbflex.player;
        App.Music.Core = jPlayer;
    });

    App.on('bbflex-widget-loading', 'render', function (widget) {
        widget.wrapInner('<div class="flex-widget-container">');
        widget.find('.flex-widget-container').first().bbflex('applyBindings');
        widget.attr('data-bind', 'bindShield: true');
    });

    App.on('bbflex-app-launched', 'render', function () {
        $('body').addClass('flex-ready');
    });

    App.on('bbflex-modal-open', 'render', function (modal) {
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

    App.on('bbflex-modal-close', 'render', function (modal) {
        if (modal && modal.fwinternal) {
            modal.fwinternal.fwmodal('hide');
        }
    });

    App.on('bbflex-show-content', 'render', function (content) {

        var title = $('<span>').append('<i class="' + content.icon + '"></i> ').append(content.title);
        var body = $('<div>').html(content.content);
        var footer = $('<button type="button" class="btn btn-default close-button">Close</button>').click(function () {
            App.modal.close();
        });

        App.modal({
            type: 'content',
            title: title,
            content: body,
            footer: footer
        });

    });

    App.on('bbflex-show-contact', 'render', function(params) {

        var config = params || {};
        var title = '<i class="fwicon-mail"></i> &nbsp;Send Email';

        var contact_form = $('<div>').bbflex($.extend(config, { widget: 'contactform' }));
            contact_form.prepend('<p>Contact us by email using our contact form.</p>')
            contact_form.find('button').remove();

        var footer = $('<span>')
            .append('<button type="button" class="btn btn-default close-button">Close</button>')
            .append('<button type="button" class="btn btn-success submit-button">Send Email</button>');

        footer.find('.close-button').click(function () {
            App.modal.close();
        });

        footer.find('.submit-button').click(function() {
            contact_form.find('form').submit();
        });

        App.modal({
            type: 'contact',
            title: title,
            content: contact_form,
            footer: footer
        });

    });

    /* Music Events */

    App.on('bbflex-nowplaying', 'render', function (media) {
        // if the song has changed, reset our "play tracked" flag
        if (App.Music.notSelected(media)) {
            App.Data.playTracked = false;
            // load more music if we're on the last song of a dynamic playlist
            var playlist = App.Music.playlists[media.playlist];
            App.Music.usePlaylist(media.playlist);
            if (playlist.dataSource instanceof Object && playlist.media.length == media.playlistIndex + 1) {
                playlist.dataSource.nextPage();
            }
        }
        App.Music.nowplaying(media);
        App.Music.Playlist[media.playlist].nowplaying(media);
    });

    App.on('bbflex-play', function (event) {
        var media = event.jPlayer.status.media;
        App.Music.Core = $(event.target);
        App.Music.Player = $(event.target).data('jPlayerPlaylist') || $.bbflex.player;
        if (App.Music.notSelected(media)) {
            App.trigger('bbflex-nowplaying', media);
        }
        if (!App.Data.playTracked) { // track the play if it hasn't been already
            App.Data.playTracked = true;
            App.trackAction({ nid: media.nid, uid: media.uid, group: 'Engagement', name: 'Plays', label: media.title });
        }
        App.Music.paused(false);
    });

    App.on('bbflex-pause', function (event) {
        if ($(event.target)[0] === App.Music.Core[0]) {
            App.Music.paused(true);
        }
    });

    App.on('bbflex-timeupdate', function (event) {
        var scrubValue = event.jPlayer.status.currentPercentAbsolute;
        if (!App.Data.scrubSliding) {
            App.Music.seekPosition(scrubValue);
        }
    });

    App.on('bbflex-volumechange', function (event) {
        var volume = event.jPlayer.options.volume;
        $.cookie('_vol', volume, { path: '/' });
    });


    /* Playlist Related Events */

    // -- Listener
    App.on('bbflex-playlist-scrolled-bottom', function (id, widget) {
        id = id || App.Music.currentPlaylist;
        if (App.Music.playlists[id] && App.Music.playlists[id].dataSource) {
            App.Music.playlists[id].dataSource.nextPage();
        }
    });

    App.on('bbflex-playlist-updated', function (id, media, index) {
        if (!App.Music.Playlist[id].nowplaying() || !App.Music.Playlist[id].nowplaying().nid) {
            App.Music.Playlist[id].nowplaying(App.Music.Playlist[id]()[0])
        }
    });

    App.on('bbflex-show-playlists', 'render', function () {

        var content = $('<div>').bbflex({ widget: 'playlists', theme: 'none' });
        content.find('.fw-playlists').on('click', '.fw-list-title', function () {
            App.modal.close();
        });

        var footer = $('<button type="button" class="btn btn-default close-button">Close</button>').click(function () {
            App.modal.close();
        });

        App.modal({
            type: 'playlists',
            title: '<i class="fwicon-itunes"></i> Playlist Selection',
            content: content,
            footer: footer
        });

    });

    App.on('bbflex-show-playlist', 'render', function (id) {

        var playlist = App.Music.playlists[playlist] || App.Music.activePlaylist();
        var content = $('<div>').bbflex({ widget: 'playlist', theme: 'none', playlist: id });

        var footer = $('<button type="button" class="btn btn-default close-button">Close</button>').click(function () {
            App.modal.close();
        });

        App.modal({
            type: 'playlist',
            title: '<i class="fwicon-itunes"></i> ' + playlist.title,
            content: content,
            footer: footer
        });

    });

    App.on('bbflex-show-search', 'render', function() {


        var title = $('<div><i class="fwicon-itunes"></i> Search Music</div>');

        var content;
        if (App.Music.playlists.search) {
            content = $('<div>').bbflex({ widget: 'playlist', theme: 'none', playlist: 'search' });
        } else {
            content = $('<div>').append('Type a search query to find beats.');
            App.once('bbflex-search-starting', function() {
                content.activity();
            });
            App.once('bbflex-search-complete', function() {
                content.activity(false);
                content.bbflex({ widget: 'playlist', theme: 'none', playlist: 'search' });
            });
        }

        var footer = $('<div><button type="button" class="btn btn-default close-button">Close</button></div>');
            footer.find('.close-button').click(function () {
            App.modal.close();
        });

        title.prepend(
        '<div style="float:right; margin-right:15px; max-width:50%; text-align:right;">' +
            '<input style="vertical-align:middle; max-width:70%;" type="text" id="search" value="' + App.Music.search() + '"> ' +
            '<button style="max-width:25%" type="button" class="btn btn-success do-search btn-sm">Search</button>' +
        '</div>');

        var doSearch = function() {
            var search = title.find('#search');
            if (search.val()) {
                App.Music.search(search.val());
            }
        };

        title.find('.do-search').click(doSearch);
        title.find('#search').keyup(function(event){
            if(event.keyCode == 13){
                doSearch();
            }
        });

        App.modal({
            type: 'search',
            title: title,
            content: content,
            footer: footer
        });

    });

    /* Licensing Events */

    App.on('bbflex-show-license', 'render', function (license) {
        var cartItem;
        var info;
        var songname;
        if (license.cart_item_id) {
            cartItem = license;
            info = license.license;
            songname = cartItem.title;
        }
        else {
            cartItem = $.map(App.Cart.data().items, function (item) {
                return item.nid == license.nid && item.option == license.option ? item : undefined;
            })[0];
            info = license;
            songname = info.songname;
        }

        var actionButton = cartItem ?
            '<button id="modalCartRemove" type="button" class="btn btn-danger"><i class="fwicon-trash"></i> Remove From Cart</button>' :
            '<button id="modalCartAdd" type="button" class="btn btn-primary"><i class="fwicon-plus"></i> Add To Cart</button>';

        var content = $('<div>').append('<h1>' + songname + '</h1><div class="delivery"><span class="includes">Includes:</span> <span class="files">' + info.files + '</span></div>' + info.terms + '<p>' + info.description + '</p>');

        var footer = $('<div>').append('<button type="button" class="btn btn-default close-button">Close</button>' + actionButton);
        footer.find('#modalCartAdd').click(function () {
            App.Cart.add(license);
            App.modal.close();
        });
        footer.find('#modalCartRemove').click(function () {
            App.Cart.remove(cartItem);
            App.modal.close();
        });
        footer.find('.close-button').click(function () {
            App.modal.close();
        });

        App.modal({
            type: 'license',
            title: info.name + ' $' + info.price,
            content: content,
            footer: footer
        });

    });

    App.on('bbflex-show-license-options', 'render', function (media) {
        media = media || App.Music.nowplaying();

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

            var cartItem = $.map(App.Cart.data().items, function (item) {
                return item.nid == license.nid && item.option == license.option ? item : undefined;
            })[0];

            cartItem ?
                thiscontent.append('<button type="button" class="btn btn-sm btn-danger cart-remove"><i class="fwicon-trash"></i> Remove From Cart</button>') :
                thiscontent.append('<button type="button" class="btn btn-sm btn-primary cart-add"><i class="fwicon-plus"></i> Add To Cart</button>');

            thiscontent.append('\
	  <h3 class="fw-license-title"><i class="fwicon-tag"></i> ' + license.name + ': <strong>$' + license.price + '</strong></h3>\
	  ' + '<div class="delivery"><span class="includes">Includes:</span> <span class="files">' + license.files + '</span></div>' + license.terms + '<p>' + license.description + '</p>\
	');

            thiscontent.append('<hr>');

            thiscontent.find('.cart-add').click(function () {
                App.Cart.add(license);
                App.modal.close();
            });

            thiscontent.find('.cart-remove').click(function () {
                App.Cart.remove(cartItem);
                App.modal.close();
            });

            content.append(thiscontent);

        });

        var footer = $('<button type="button" class="btn btn-default">Close</button>').click(function () {
            App.modal.close();
        });

        App.modal({
            type: 'licenseoptions',
            title: '<i class="fwicon-tags"></i> Available Licensing Options',
            content: content,
            footer: footer
        });

    });


    /* Cart Related Events */

    App.on('bbflex-checkout-initiated', 'after', function () {
        var cart = App.Cart.data();
        if (cart.items && cart.items.length) {
            if (App.appSettings.app_affiliate) {
                if (App.appSettings.bootmode != 'disabled' && !(App.device.tablet || App.device.phone)) {
                    App.fullScreen('checkout');
                }
                else {
                    App.ajax({
                        url: 'https://api.beatbrokerz.com/cart/checkout/session',
                        data: {
                            app_id: App.appSettings.app_id,
                            ref: document.location.href.replace(document.location.hash, '')
                        },
                        success: function (result) {
                            var checkout_url = App.checkoutURL;
                            if (App.session_id) {
                                checkout_url = checkout_url + '?_fsid=' + App.session_id;
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

    App.on('bbflex-show-cart', 'render', function () {
        var totals = $('<div class="fw-cart-totals-wrap">\
      <div data-bind="text: \'Subtotal: $\' + flexStore.Cart.data().sub_total" class="fw-cart-subtotal"></div>\
      <div data-bind="text: \'Discounts: $\' + flexStore.Cart.data().discounts.total" class="fw-cart-discounts"></div>\
      <div data-bind="text: \'Total: $\' + flexStore.Cart.data().total" class="fw-cart-total"></div>\
    </div>');
        totals.bbflex('applyBindings');
        var footer = $('<div>').append('<button type="button" class="btn btn-default close-button">Close</button><button data-bind="visible: flexStore.Cart.data().items.length > 0" type="button" class="btn btn-success checkout-button"><i class="fwicon-dollar"></i> &nbsp;Checkout</button>');
        footer.find('.close-button').click(function () {
            App.modal.close();
        });
        footer.bbflex('applyBindings');

        var content = $('<div>').bbflex({ widget: 'cart', theme: 'none' }).append(totals);

        footer.find('.checkout-button').click(function () {
            App.modal.close();
            flexStore.Cart.checkout();
        });

        App.modal({
            type: 'cart',
            title: '<i class="fwicon-basket"></i> Shopping Cart',
            content: content,
            footer: footer
        });

    });

    /*
     *  STATS TRACKING
     */

    App.trackPageView = function (settings) {
        var page = $.extend({
            channel: (App.appSettings.app_affiliate ? App.appSettings.app_name + ' (app)' : App.appSettings.app_name ),
            url: location.href
        }, settings);
        if (typeof OWATracker !== 'undefined') {
            var nid = page.nid || 0;
            var uid = page.uid || 0;
            var channel = page.channel || '';
            var affiliate = (App.appSettings.app_affiliate ? App.appSettings.acct_id : 0);
            OWATracker.setCustomVar(1, 'nid', nid, 'page');
            OWATracker.setCustomVar(2, 'uid', uid, 'page');
            OWATracker.setCustomVar(4, 'channel', channel, 'page');
            OWATracker.setCustomVar(5, 'affiliate', affiliate, 'page');
            OWATracker.trackPageView(page.url);
        }
    };

    App.trackAction = function (settings) {
        var action = $.extend({
            channel: (App.appSettings.app_affiliate ? App.appSettings.app_name + ' (app)' : App.appSettings.app_name ),
            group: 'Ungrouped',
            name: 'Unnamed',
            label: 'Unlabelled',
            value: 1
        }, settings);
        if (typeof OWATracker !== 'undefined') {
            var nid = action.nid || 0;
            var uid = action.uid || 0;
            var channel = action.channel || '';
            var affiliate = (App.appSettings.app_affiliate ? App.appSettings.acct_id : 0);
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
    App.navigation = [
        { title: "Home", action: "#home", icon: "home", root: true },
        { title: "Producers", action: "#producers", icon: "user", visible: ko.computed(function () {
            return App.Producers.list().length > 0;
        }), root: true },
        { title: "Playlists", action: "#playlists", icon: "menu", root: true },
        { title: "Special Offers", action: "#discounts", icon: "tags", visible: ko.computed(function () {
            return App.Discounts.list().length > 0;
        }), root: true },
        { title: "Content", action: "#menu", icon: "doc", visible: App.appContent && $.map(App.appContent,function () {
            return true;
        }).length > 0, root: true },
        { title: "Now Playing", action: "#nowplaying", icon: "music", root: true },
        { title: "Shopping Cart", action: "#cart", icon: "cart", root: true },
        { title: "Close", action: function () {
            App.closeApp();
        }, icon: "close", visible: App.baseVars.closeVisible, root: false }
    ];


})(jQuery, flexStore);
