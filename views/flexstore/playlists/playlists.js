(function ($, myApp) {

    myApp.playlists = function (params) {

        var viewModel = {

            listGroups: DevExpress.data.createDataSource({
                load: function (loadOptions) {
                    if (loadOptions.refresh) {
                        var listGroups = {};
                        $.each(myApp.Music.playlists, function (id, list) {
                            if (list.media.length) {
                                if (typeof listGroups[list.category] === 'object') {
                                    listGroups[list.category].items.push({ title: list.title, id: id, count: myApp.Music.Playlist[id].count });
                                }
                                else {
                                    listGroups[list.category] = {
                                        key: list.category,
                                        items: [
                                            { title: list.title, id: id, count: myApp.Music.Playlist[id].count }
                                        ]
                                    };
                                }
                            }
                        });
                        return $.map(listGroups, function (group, category) {
                            return group;
                        });
                    }
                }
            }),

            showList: function (action) {
                var list = action.itemData;
                myApp.app.navigate({ view: 'playlist', key: list.id });
            },

            viewShown: function (e) {
                myApp.Datasource.reload(viewModel.listGroups);
            }

        };

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);