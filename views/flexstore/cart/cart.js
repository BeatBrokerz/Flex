(function ($, myApp) {

    myApp.cart = function (params) {

        var cartItems = myApp.Data.cart ? myApp.Data.cart.items : [];

        var viewModel = {

            cartItems: ko.observableArray(cartItems),
            cartSubtotal: ko.observable(myApp.Data.cart.sub_total),
            cartTotal: ko.observable(myApp.Data.cart.total),
            cartDiscounts: ko.observable(myApp.Data.cart.discounts.total),

            licenseName: ko.observable(''),
            licenseInfo: ko.observable(''),
            licenseInfoType: ko.observable(''),

            actionSheetVisible: ko.observable(false),
            actionSheetTitle: ko.observable('Cart Item Options'),
            loadPanelVisible: ko.observable(false),
            loadPanelText: ko.observable('Processing...'),
            checkoutVisible: ko.observable(cartItems.length > 0),
            popupVisible: ko.observable(false),

            itemMenu: function (action) {
                var item = action.itemData;
                viewModel.actionSheetItem = item;
                viewModel.actionSheetTitle(item.title);
                viewModel.actionSheetVisible(true);
            },

            removeItem: function (action) {
                viewModel.loadPanelVisible(true);
                var item = viewModel.actionSheetItem;
                myApp.Cart.remove(item, function (response) {
                    viewModel.loadPanelVisible(false);
                    viewModel.cartItems.remove(function (el) {
                        return el.cart_item_id == item.cart_item_id;
                    });
                });
            },

            viewLicense: function (e) {
                var item = viewModel.actionSheetItem;
                var license = item.license;
                var component = e.component;
                switch (component._options.text) {
                    case 'License Terms':
                        viewModel.licenseName(license.name + ' ' + item.price);
                        viewModel.licenseInfoType('License Terms');
                        viewModel.licenseInfo(license.terms);
                        break;

                    default:
                        viewModel.licenseName(license.name + ' ' + item.price);
                        viewModel.licenseInfoType('License Description');
                        viewModel.licenseInfo(license.description);
                }
                viewModel.popupVisible(true);
            },

            hideLicense: function (action) {
                viewModel.popupVisible(false);
            },

            playBeat: function (e) {
                var item = viewModel.actionSheetItem;
                var media = myApp.Music.playlists.cart.media[item.playlistIndex];
                myApp.Music.playMedia(media);
                myApp.app.navigate('nowplaying');
            },

            refreshCart: function () {
                var myItems = myApp.Data.cart ? myApp.Data.cart.items : [];
                if (viewModel.cartItems().length != myItems.length) {
                    viewModel.cartItems.removeAll();
                    $.each(myItems, function (index, item) {
                        viewModel.cartItems.push(item);
                    });
                }
                viewModel.cartSubtotal(myApp.Data.cart.sub_total);
                viewModel.cartTotal(myApp.Data.cart.total);
                viewModel.cartDiscounts(myApp.Data.cart.discounts.total);
                viewModel.checkoutVisible(cartItems.length > 0);
            },

            actionSheetData: DevExpress.data.createDataSource({
                load: function () {
                    return [
                        { text: "Preview / Listen", clickAction: viewModel.playBeat, type: 'success' },
                        { text: "License Terms", clickAction: viewModel.viewLicense },
                        { text: "License Description", clickAction: viewModel.viewLicense },
                        { text: "Remove", clickAction: viewModel.removeItem, type: 'danger' }
                    ];
                }
            }),

            viewShown: function (e) {
                viewModel.refreshCart();
            }

        };

        return viewModel;

    };

})(jQuery, window[myAppNamespace]);