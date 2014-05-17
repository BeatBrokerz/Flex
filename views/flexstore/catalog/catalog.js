(function ($, myApp) {

    myApp.Data.Producers = {};

    myApp.catalog = function (params) {

        var producer = myApp.Data.Producers[params.account];

        if (!producer.uid) {
            myApp.app.navigate('home');
        }

        // the playlist to use for our catalog beats
        var myPlaylist = 'catalog_' + params.account;

        if (myApp.Music.playlists[myPlaylist]) {
            var playlist = myApp.Music.playlists[myPlaylist];
        }
        else {

            var dataModel = { page: 0, counter: 0, total: 0 };
            myApp.Music.resetPlaylist({ id: myPlaylist, title: producer.name || 'Unknown', category: 'Producer', type: 'producer' });
            var playlist = myApp.Music.playlists[myPlaylist];

            playlist.dataSource = DevExpress.data.createDataSource({

                load: function (loadOptions) {

                    if (loadOptions.refresh) {
                        myApp.Music.resetPlaylist(playlist);
                        dataModel.page = 0;
                        dataModel.counter = 0;
                    }
                    else {
                        dataModel.page++;
                    }

                    if (dataModel.page && (dataModel.page * 25) + 1 > dataModel.count) {
                        return [];
                    }

                    var reqParams = {
                        music: myPlaylist
                    };

                    var deferred = new $.Deferred();
                    myApp.ajax({
                        url: 'https://m.beatbrokerz.com/catalog/' + params.account + '/json',
                        data: $.extend({ page: dataModel.page }, reqParams),
                        success: function (catalog) {

                            dataModel.count = catalog.total_count;
                            var beats = $.map(catalog.items, function (item) {
                                var beat = item.beat;

                                // keep track of beat positions
                                dataModel.counter++;
                                beat.position = dataModel.counter;

                                // add beats into our playlist
                                beat.playlist = myPlaylist;
                                beat.playlistIndex = myApp.Music.addToPlaylist(myPlaylist, beat);

                                return beat;

                            });
                            myApp.Music.Playlist[myPlaylist].count(catalog.total_count);
                            deferred.resolve(beats);
                        }
                    });
                    return deferred;

                }
            });

        }

        var viewModel = {

            title: ko.observable(producer.name),

            badgeDetailsVisible: ko.observable(false),
            badgeName: ko.observable(''),
            badgeImage: ko.observable(''),
            badgeDescription: ko.observable(''),

            producer: producer,

            // Data Sources
            catalogBeats: playlist.dataSource,

            discountsList: producer.discounts,

            tabs: {
                tabChangeAction: function (e) {
                    var sel = viewModel.tabs.selectedIndex();
                    var tab = viewModel.tabs.items[sel];
                    if (tab.view) {
                        myApp.app.navigate(tab.view);
                        return;
                    }
                    $.each(viewModel.tabs.items, function (index, item) {
                        $(item.container).css({ 'position': 'absolute', 'left': -10000 });
                    });
                    $(tab.container).css({ 'position': 'relative', 'left': '0' });
                },
                items: [
                    { text: 'Profile', icon: 'user', container: '.profile-content' },
                    { text: 'Beats', icon: 'music', container: '.beats-list' },
                    { text: 'Discounts', icon: 'tags', container: '.discounts-list' }
                ],
                selectedIndex: ko.observable(params.tab || 0)
            },

            /*
             *  Methods
             */

            playBeat: function (action) {
                var media = action.itemData;
                myApp.Music.playMedia(media);
                myApp.app.navigate('nowplaying');
            },

            visitSocial: function (action) {
                var item = action.itemData;
                window.open(item.url, '_blank');
            },

            viewDiscount: function (action) {
                var discount = action.itemData;
                myApp.app.navigate('discount/' + discount.id);
            },

            showBadge: function (action) {
                var badge = action.itemData;
                viewModel.badgeName(badge.name);
                viewModel.badgeImage(badge.image);
                viewModel.badgeDescription(badge.description);
                viewModel.badgeDetailsVisible(true);
            },

            hideBadgeDetails: function (e) {
                viewModel.badgeDetailsVisible(false);
            },

            viewShown: function (e) {
                viewModel.tabs.tabChangeAction();
            },

            viewRendered: function (e) {
                $(".producer-description").click(function () {
                    $(this).css({ 'max-height': 'none' });
                });
            }

        }

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);