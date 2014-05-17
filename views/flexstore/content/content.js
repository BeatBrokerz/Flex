(function ($, myApp) {

    myApp.content = function (params) {

        if (!params.cat || typeof params.id === 'undefined') {
            myApp.app.navigate('home');
        }

        if (!myApp.appContent || !myApp.appContent[params.cat] || !myApp.appContent[params.cat].content[params.id]) {
            myApp.app.navigate('home');
        }
        var content = myApp.appContent[params.cat].content[params.id];

        var viewModel = {

            title: $('<textarea/>').html(content.category).text(),
            content: content,
            pagecontent: ko.observable(''),
            loadPanelVisible: ko.observable(false)

        }

        viewModel.loadPanelVisible(true);
        myApp.Content.prepare(content, function () {
            viewModel.loadPanelVisible(false);
            viewModel.pagecontent(content.content);
        });

        return viewModel;

    };

})(jQuery, window[myAppNamespace]);