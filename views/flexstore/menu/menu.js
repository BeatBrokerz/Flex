(function ($, myApp) {

    myApp.menu = function (params) {

        if (!$.map(myApp.appContent,function (c, i) {
            return i
        }).length || (params.cat && !myApp.appContent[params.cat])) {
            if (params.cat) {
                myApp.app.navigate('menu');
            }
        }

        // top level content menu
        if (!params.cat) {

            var title = "Content Menu";
            var uncategorized = [];
            // list categories
            var menu = $.map(myApp.appContent, function (category, catid) {

                if (!category.catid) return;

                if (catid != 'f15c1cae7882448b3fb0404682e17e61') {
                    return $.extend({ icon: 'fwicon-folder' }, category);
                }
                else {
                    // we'll add our uncategorized content to the end of the list
                    uncategorized = category.content;
                }

            });
            // list uncategorized content
            $.each(uncategorized, function (i, content) {
                if (content.icon == '') delete content.icon;
                menu.push($.extend({ icon: 'fwicon-doc-inv' }, content));
            });
        }

        // category level content menu
        else {
            var title = $('<textarea/>').html(myApp.appContent[params.cat].title).text();
            var menu = $.map(myApp.appContent[params.cat].content, function (content, index) {
                if (content.icon == '') delete content.icon;
                return $.extend({ icon: 'fwicon-doc-inv' }, content);
            });
        }

        var viewModel = {

            title: title,

            menuitems: menu,

            browseTo: function (action) {
                var item = action.itemData;
                if (item.type && item.type == 'category') {
                    myApp.app.navigate({ view: 'menu', cat: item.catid});
                }
                else {
                    myApp.app.navigate({ view: 'content', cat: item.catid, id: item.index });
                }
            }


        }

        return viewModel;

    };


})(jQuery, window[myAppNamespace]);