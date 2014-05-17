(function ($, myApp) {

    myApp.checkout = function (params) {

        var referer_url = encodeURIComponent(document.location.href.replace(document.location.hash, ''));
        var checkout_url = myApp.checkoutURL;
        var checkout_params = [];
        if (myApp.appSettings.app_affiliate) {
            checkout_params.push('app_id=' + myApp.appSettings.app_id);
            checkout_params.push('ref=' + referer_url);
        }
        else {
            checkout_params.push('noapp');
        }

        if (myApp.session_id) {
            checkout_params.push('_fsid=' + myApp.session_id);
        }
        if (checkout_params.length) {
            checkout_url = checkout_url + '?' + checkout_params.join('&');
        }

        var viewModel = {

            checkoutURL: ko.observable(checkout_url),
            loadPanelText: ko.observable('Loading...'),
            loadPanelVisible: myApp.checkout.loadPanelVisible,

            viewShown: function (e) {
                if (!myApp.Data.cart.items.length) {
                    myApp.app.navigate('cart');
                }
            },

            viewRendered: function (e) {
                var currentPlatform = DevExpress.devices.current().platform;
                if (currentPlatform === "ios" && window.self === window.top) {
                    $(".dx-iframe-content").addClass('iOS-fix');
                }
                $("#iframe-window").load(function () {
                    myApp.checkout.loadPanelVisible(false);
                    $('#iframe-window').contents().find('form').submit(function () {
                        myApp.checkout.loadPanelVisible(true);
                    });
                    if (currentPlatform === "ios") {
                        $('#iframe-window').contents().find('body').css('-webkit-transform', 'translate3d(0, 0, 0)');
                    }
                });
            }

        }

        return viewModel;

    };

    myApp.checkout.loadPanelVisible = ko.observable(true);

    $.appflow.bind('message-received', function (message) {
        var origin = message.origin.split("://");
        if (origin[1].indexOf('.beatbrokerz.com') && message.data == 'iframe-unloading') {
            myApp.checkout.loadPanelVisible(true);
        }
    });

})(jQuery, window[myAppNamespace]);