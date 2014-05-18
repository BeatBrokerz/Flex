(function ($, myApp) {

    myApp.nowplaying = function (params) {

        var defaultTab = typeof params.tab !== 'undefined' ? params.tab : 0;

        var viewModel = {

            // Song Information
            songname: ko.computed(function () {
                return myApp.Music.nowplaying().title;
            }),
            artist: ko.computed(function () {
                return myApp.Music.nowplaying().artist;
            }),
            image: ko.computed(function () {
                return myApp.Music.nowplaying().image;
            }),
            genres: ko.computed(function () {
                return myApp.Music.nowplaying().genres;
            }),

            detailsPopupVisible: ko.observable(false),
            licensePopupVisible: ko.observable(false),
            licenseSheetVisible: ko.observable(false),
            licenseSheetTitle: ko.observable(''),
            licenseName: ko.observable(''),
            licenseInfoType: ko.observable(''),
            licenseInfo: ko.observable(''),

            loadPanelVisible: ko.observable(false),
            loadPanelText: ko.observable('Processing...'),

            // Control Variables
            paused: ko.computed(function () {
                return myApp.Music.paused();
            }),
            playing: ko.computed(function () {
                return !myApp.Music.paused();
            }),

            tabs: {
                tabChangeAction: function (e) {
                    var sel = viewModel.tabs.selectedIndex();
                    var tab = viewModel.tabs.items[sel];
                    if (tab.view) {
                        myApp.app.navigate(tab.view);
                        return;
                    }
                    sel == 0 ? $(".view-content").removeClass('mini').addClass('full') : $(".view-content").removeClass('full').addClass('mini');
                    if (tab.container == '.nowplaying-playlist') {
                        viewModel.currentPlaylist = myApp.Music.playlists[myApp.Music.currentPlaylist].dataSource;
                    }
                    $.each(viewModel.tabs.items, function (index, item) {
                        $('.dx-viewport ' + item.container).hide();
                    });
                    $('.dx-viewport ' + tab.container).show();
                },
                items: [
                    { text: 'Preview', icon: 'music', container: '.tab-preview' },
                    { text: 'Buy Now', icon: 'money', container: '.nowplaying-licenses' },
                    { text: 'Playlist', icon: 'menu', container: '.nowplaying-playlist' }
                ],
                selectedIndex: ko.observable(defaultTab)
            },

            currentPlaylist: myApp.Music.activePlaylistItems,
            buyNowLicenses: ko.computed(function () {
                return myApp.Music.nowplaying().licensing ? myApp.Music.nowplaying().licensing.options : [];
            }),

            licenseActionSheet: DevExpress.data.createDataSource({
                load: function () {
                    return [
                        { text: "Add To Cart", clickAction: viewModel.addToCart, icon: 'cart', type: 'success' },
                        { text: "License Terms", clickAction: viewModel.viewLicense, id: 'terms' },
                        { text: "License Description", clickAction: viewModel.viewLicense, id: 'description' }
                    ];
                }
            }),


            /*
             *  Events
             */

            // Capture scrubber movement event
            viewRendered: function () {
                $("#nowplaying-scrubber").on("mousedown", viewModel.startScrub).on("touchstart", viewModel.startScrub);
                $("#nowplaying-info-data").click(function () {
                    myApp.app.navigate('catalog/' + myApp.Music.nowplaying().uid);
                });
                $(document).on("mouseup", viewModel.endScrub).on("touchend", viewModel.endScrub);
                if (!myApp.Music.nowplaying()) {
                    for (var list in myApp.Music.playlists) {
                        if (myApp.Music.playlists[list].media.length) {
                            myApp.Music.selectMedia(myApp.Music.playlists[list].media[0]);
                            break;
                        }
                    }
                }
            },

            viewShowing: function (e) {
            },

            viewShown: function (e) {
                var maxWidth = $(".nowplaying.view-content").height() - 300;
                $(".nowplaying-image img").css({ 'max-width': maxWidth > 250 ? 250 : maxWidth < 75 ? 75 : maxWidth });
                viewModel.tabs.tabChangeAction();
            },

            /*
             *  Methods
             */
            playBeat: function (action) {
                var media = action.itemData;
                myApp.Music.playMedia(media);
                myApp.app.navigate('nowplaying');
            },

            // buy now license clicked... show the action sheet
            showLicenseActions: function (action) {
                var license = action.itemData;
                viewModel.actionSheetLicense = license;
                viewModel.licenseSheetTitle(license.name + ' ' + license.price);
                viewModel.licenseSheetVisible(true);
            },

            // add to cart clicked from action sheet
            addToCart: function (action) {
                viewModel.loadPanelVisible(true);
                var license = viewModel.actionSheetLicense;
                myApp.Cart.add(license, function (response) {
                    viewModel.loadPanelVisible(false);
                });
                viewModel.licensePopupVisible(false);
            },

            // view license info clicked from action sheet
            viewLicense: function (e) {
                var license = viewModel.actionSheetLicense;
                var component = e.component;
                switch (component._options.text) {
                    case 'License Terms':
                        viewModel.licenseName(license.name + ' ' + license.price);
                        viewModel.licenseInfoType('License Terms');
                        viewModel.licenseInfo(license.terms);
                        break;

                    default:
                        viewModel.licenseName(license.name + ' ' + license.price);
                        viewModel.licenseInfoType('License Description');
                        viewModel.licenseInfo(license.description);
                }
                viewModel.licensePopupVisible(true);
            },

            // license info popup close button clicked
            hideLicense: function (action) {
                viewModel.licensePopupVisible(false);
            },

            startScrub: function () {
                myApp.Data.scrubSliding = true;
            },

            endScrub: function () {
                if (myApp.Data.scrubSliding) {
                    myApp.Data.scrubSliding = false;
                    viewModel.scrubberChanged();
                }
            },

            updateScrubber: function (value) {
                // only update the scrubber if it's not being dragged
                if (!myApp.Data.scrubSliding) {
                    viewModel.scrubValue(value);
                }
            },

            scrubberChanged: function () {
                var slider = $("#nowplaying-scrubber").dxSlider("instance");
                myApp.Music.playHead(slider.option('value'));
            },

            showDetails: function () {
                viewModel.detailsPopupVisible(true);
            },

            hideDetails: function () {
                viewModel.detailsPopupVisible(false);
            }

        };

        return viewModel;

    };

    myApp.nowplaying.showbutton = ko.observable(true);

})(jQuery, window[myAppNamespace]);