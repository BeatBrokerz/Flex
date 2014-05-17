flexloader.extendApp(function ($, myApp, config) {

    if (config.autoload) {
        flexloader.addCSS(config.script.basepath + "widget.css");
        flexloader.addResources({
            path: {
                missing: function () {
                    return typeof jQuery === 'undefined' || typeof jQuery.path === 'undefined';
                },
                src: "//www.beatbrokerz.com/flex/js/jquery.path.js"
            }
        });
        if (config.options && config.options.autoconfig) {
            $('body').append('<div data-bbflex="widget:fwscreenplay">');
        }
    }

    myApp.addWidget('fwscreenplay', {

        html: function (template, settings) {
            return '\
        <div data-bind="visible: music.nowplaying().nid > 0" style="display:none">\
	  <div class="fw-screenplay-content">\
	    <img class="fw-beat-image" data-bind="click: music.showLicenseOptions"/>\
	    <div class="fw-screenplay-info csstransition">\
	      <div data-bind="visible: app.settings.bootmode != \'disabled\'" class="fw-fullscreen-tr"><i data-bind="click: app.fullScreen" class="fwicon-resize-full"></i></div>\
	      <div class="fw-heading"><i class="fwicon-music"></i> Now Playing</div>\
	      <div class="fw-beat-title" data-bind="html: nowplaying().title"></div>\
	      <div class="fw-beat-artist" data-bind="html: nowplaying().artist"></div>\
	      <div class="fw-beat-genres" data-bind="html: nowplaying().genres"></div>\
	      <div class="fw-beat-description" data-bind="html: nowplaying().description"></div>\
	      <div class="fw-license-options" data-bind="click: music.showLicenseOptions"><i class="fwicon-tag"></i> <span data-bind="html: nowplaying().licensing.options.length"></span> License<span data-bind="if: nowplaying().licensing.options.length != 1">s</span> Available For Purchase</div>\
	      <div data-bbflex="widget: \'playbar\', width: 370, fullscreen: false"></div>\
	    </div>\
	  </div>\
	</div>\
      ';
        },
        init: function (template, widget, settings) {

            var image = widget.find('.fw-beat-image');
            image.attr('src', myApp.Music.nowplaying().image);

            widget.hover(function () {
                $(this).addClass('hovering');
            }, function () {
                $(this).removeClass('hovering');
            });

            myApp.on('bbflex-nowplaying', function (media) {

                if (widget.hasClass('hovering')) {
                    image.animate({ opacity: 0, left: -400 }, function () {
                        image.removeClass('csstransition').attr('src', media.image);
                        image.css({ left: 400 }).animate({ left: 0, opacity: 1 }, function () {
                            image.addClass('csstransition');
                        });
                    });
                }
                else {
                    image.removeClass('csstransition').css({ opacity: 0, left: 400, width: 500 });
                    image.attr('src', media.image);
                    image.animate({ left: 0, opacity: 1, width: 100 }, function () {
                        image.css({ width: '' }).addClass('csstransition');
                    });
                }

            });

        }

    });
});
