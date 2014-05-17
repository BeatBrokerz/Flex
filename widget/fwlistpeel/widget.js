flexloader.extendApp(function ($, myApp, config) {

    if (config.autoload) {
        flexloader.addResources({
            'modernizr-custom': { "//www.beatbrokerz.com/flex/js/modernizr.js" },
            dragabilly: { src: config.script.basepath + "js/draggabilly.pkgd.min.js" },
            elastiStack: { src: config.script.basepath + "js/elastiStack.js" }
        });
        flexloader.addCSS(config.script.basepath + "widget.css");
    }

    myApp.addWidget('fwlistpeel', {

        html: function (template, settings) {
            if (settings.playlist && typeof myApp.Music.Playlist[settings.playlist] === 'undefined') {
                settings.playlist = undefined;
            }
            settings = $.extend({ size: 'large' }, settings);
            return '\
        <ul class="elasticstack ' + settings.size + '" data-bind="foreach: ' + (settings.playlist ? 'music.Playlist[\'' + settings.playlist + '\']' : 'music.activePlaylistItems') + '">\
	  <li>\
	    <img data-bind="attr: { src: image, title: title }"/>\
	    <div class="fw-songinfo">\
	      <div class="fw-play" data-bind="visible: $root.music.nowplaying().nid != nid || $root.music.paused(), click: $root.music.playMedia"><i class="fwicon-play"></i></div>\
	      <div class="fw-pause" style="display:none" data-bind="visible: $root.music.playing() && $root.music.nowplaying().nid == nid, click: $root.music.pause"><i class="fwicon-pause"></i></div>\
	      <div class="fw-title" data-bind="html: title"></div>\
	      <div class="fw-artist" data-bind="html: artist"></div>\
	      <div class="fw-genres" data-bind="html: genres"></div>\
	    </div>\
	  </li>\
	</ul>\
      ';
        },
        init: function (template, widget, settings) {

            var elastiStack = new ElastiStack(widget.find('.elasticstack')[0]);

            myApp.on('bbflex-playlist-updated', function (id, media, index) {
                if (!settings.playlist || settings.playlist == id) {
                    elastiStack._refresh();
                }
            });

            myApp.on('bbflex-playlist-changed', function (id) {
                if (!settings.playlist || settings.playlist == id) {
                    widget.fadeOut(0, function () {
                        elastiStack = new ElastiStack(widget.find('.elasticstack')[0]);
                        widget.fadeIn();
                    });
                }
            });

        }

    });
});
