(function ($, myApp) {

    myApp.playlist = function (params) {

        var playlist = params.key ? myApp.Music.playlists[params.key] : myApp.Music.playlists[myApp.Music.currentPlaylist];

        var viewModel = {

            title: playlist.title,
            selectedPlaylist: playlist.dataSource || myApp.Music.Playlist[params.key],

            playBeat: function (action) {
                var media = action.itemData;
                myApp.Music.playMedia(media);
                myApp.app.navigate('nowplaying');
            }

        }

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);