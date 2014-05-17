(function ($, myApp) {

    myApp.discount = function (params) {

        if (!myApp.Data.Discounts[params.id]) {
            $.each(myApp.Data.Producers, function (uid, producer) {
                if (producer.discounts && producer.discounts.length) {
                    $.each(producer.discounts, function (i, discount) {
                        myApp.Data.Discounts[discount.id] = discount;
                    });
                }
            });
        }
        var discount = myApp.Data.Discounts[params.id] || {};

        var viewModel = {

            title: 'Special Offer',
            discount: discount,

        };

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);