flexloader.extendApp(function ($, myApp, config) {

    if (config.autoload) {
        flexloader.addResource('modernizr-custom', { src: "//www.beatbrokerz.com/flex/js/modernizr.js" });
        flexloader.addCSS(config.script.basepath + "widget.css");
    }

    myApp.ready(function () {

        if (myApp.device.phone || myApp.device.tablet) return;

        function scrollY() {
            return window.pageYOffset || docElem.scrollTop;
        }

        var docElem = window.document.documentElement,
        // support transitions
            support = Modernizr.csstransitions,
        // transition end event name
            transEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'msTransition': 'MSTransitionEnd',
                'transition': 'transitionend'
            },
            transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ],
            docscroll = 0,
        // click event (if mobile use touchstart)
            clickevent = myApp.device.tablet ? 'touchstart' : 'click';

        if (!support) return;

        var body = $('.bbflex-page-body');

        body
            .wrapInner('<div class="fwperspective-container"><div class="fwperspective-wrapper">')
            .append('<div class="fwperspective-modal-wrapper fwmodal left vertical">')
            .wrapInner('<div id="fwperspective" class="fwperspective effect-airbnb">');

        var perspectiveWrapper = $('#fwperspective');
        var container = $('.fwperspective-container');
        var contentWrapper = $('.fwperspective-wrapper');
        var modalWrapper = $('.fwperspective-modal-wrapper');

        var onEndTransFn = function (ev) {
            perspectiveWrapper.off(transEndEventName, onEndTransFn);
            perspectiveWrapper.removeClass('modalview');
            document.body.scrollTop = document.documentElement.scrollTop = docscroll;
            contentWrapper.css({ top: 0 });
        };

        container.on(clickevent, function () {
            if (perspectiveWrapper.hasClass('animate')) {
                myApp.modal.close();
            }
        });

        //perspectiveWrapper.on( clickevent, function() { if ($(this).hasClass('modalview')) return false; } );

        myApp.on('bbflex-modal-open', function (data, options) {

            // only do the perspective modal when screen is comfortably wide
            if ($(window).width() < 800) {
                return;
            }

            modalWrapper.empty().append($('<div class="modal-title">').append(data.title)).append(data.content).append(data.footer).append('<div class="fwperspective-pad-foot"></div>').wrapInner('<div class="fwperspective-modal-inner">');
            docscroll = scrollY();
            contentWrapper.css({ top: docscroll * -1 + 'px' });
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            perspectiveWrapper.addClass('modalview');
            setTimeout(function () {
                perspectiveWrapper.addClass('animate');
            }, 25);

            return {
                control: { halt: true },
                generator: 'fwperspective'
            };

        });

        myApp.on('bbflex-modal-close', function (params) {
            if (params && params.generator == 'fwperspective') {
                modalWrapper.empty();
                perspectiveWrapper.on(transEndEventName, onEndTransFn);
                perspectiveWrapper.removeClass('animate');
            }
        });
    });
});