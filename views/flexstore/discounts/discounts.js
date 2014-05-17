(function ($, myApp) {

    // Create a cache for discounts
    myApp.Data.Discounts = {};

    myApp.discounts = function (params) {

        var viewModel = {

            title: ko.observable('Special Offers'),

            discountList: DevExpress.data.createDataSource({
                load: function (loadOptions) {
                    if (loadOptions.refresh) {
                        var listGroups = {};
                        $.each(myApp.Data.Producers, function (id, producer) {
                            if (producer.discounts.length) {
                                listGroups[id] = {
                                    key: producer.name,
                                    items: $.map(producer.discounts, function (discount, id) {
                                        // add to cache
                                        myApp.Data.Discounts[discount.id] = discount;
                                        return discount;
                                    })
                                };
                            }
                        });
                        return $.map(listGroups, function (producer, type) {
                            return producer;
                        });
                    }
                }
            }),

            viewDiscount: function (action) {
                var discount = action.itemData;
                myApp.app.navigate('discount/' + discount.id);
            }

        };

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);