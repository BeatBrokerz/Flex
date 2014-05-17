(function ($, myApp) {

    // Create a cache for producer info
    myApp.Data.Producers = {};

    myApp.producers = function (params) {

        var viewModel = {

            title: ko.observable('Music Producers'),
            filterTitle: ko.observable(''),

            page: 0,
            counter: 0,
            total: 0,
            itemsPerPage: 10,

            // Data Source
            producersList: $.map(myApp.Data.Producers, function (producer, uid) {
                return producer
            }),

            viewCatalog: function (action) {
                var producer = action.itemData;
                myApp.app.navigate({ view: 'catalog', account: producer.uid });
            }

        };

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);