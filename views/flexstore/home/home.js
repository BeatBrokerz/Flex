(function ($, myApp) {

    var adjustBG = function () {
        var win = $(window);
        var bg = $('.dx-viewport .home-view #bg');
        if (bg.length) {
            (win.width() / win.height()) < parseFloat(bg.attr('data-aspect')) ?
                bg.removeClass().addClass('bgheight') :
                bg.removeClass().addClass('bgwidth');
        }
    };

    myApp.home = function (params) {

        var viewModel = {

            apptitle: 'Music Store',
            title: ko.observable(myApp.appSettings.app_name),
            appBG: myApp.appSettings.appBG,
            social: myApp.appSettings.social,

            producersText: ko.computed(function () {
                return myApp.Producers.list().length > 1 ? "Producers" : "Producer";
            }),
            producersCount: ko.computed(function () {
                return myApp.Producers.list().length;
            }),

            contentVisible: myApp.appContent && $.map(myApp.appContent,function () {
                return true;
            }).length > 0,
            discountsVisible: ko.computed(function () {
                return myApp.Discounts.list().length > 0
            }),

            viewProducers: function () {
                if (viewModel.producersCount() == 1) {
                    myApp.app.navigate({ view: 'catalog', account: myApp.Producers.list()[0].uid });
                }
                else {
                    myApp.app.navigate('producers');
                }
            },


            viewShown: function (e) {
                adjustBG();
            }

        }

        return viewModel;

    };

    $(window).resize(adjustBG);

})(jQuery, window[myAppNamespace]);