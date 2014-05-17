flexloader.extendApp(function ($, myApp, config) {

    if (config.autoload) {
        flexloader.addCSS(config.script.basepath + 'widget.css');
        if (config.options && config.options.autoconfig) {
            $('body').append('<div data-bbflex="widget:fwdock">');
        }
    }

    myApp.addWidget('fwdock', {

        html: function (template, settings) {

            var defaultSettings = $.extend({
                fullscreen: true
            }, settings);

            return '\
	  <div id="fwdock-container">\
	    <div class="fwdock-playlist-container">\
	      <div class="fwdock-playlist">\
	        <div data-bbflex="widget: \'playlist\', scroll: true"></div>\
	      </div>\
	      <div data-bind="click: music.showPlaylists" class="fwdock-playlist-more"><a href="javascript:;" class="jp-button"><i class="fwicon-cd"></i> Change Playlist</a></div>\
	      <div class="fwdock-playlist-title-wrap">\
	        <i class="fwicon-music"></i> <span class="fwdock-title" data-bind="html: music.activePlaylist().title"></span>\
		(<span class="fwdock-total-beats" data-bind="html: music.Playlist[music.activePlaylist().id].count">0</span> Beats)</div>\
	    </div>\
	    <div class="fwdock-music-buttons">\
	      <a href="javascript:;" class="fwdock-button small white circle fw-previous"><i class="fwicon-fast-bw" style="margin-left:-2px;"></i></a>\
	      <a href="javascript:;" class="fwdock-button medium white circle fw-play"><i class="fwicon-play"></i></a>\
	      <a href="javascript:;" class="fwdock-button medium white circle fw-pause" style="display:none"><i class="fwicon-pause" style="margin-left:1px;"></i></a>\
	      <a href="javascript:;" class="fwdock-button small white circle fw-next"><i class="fwicon-fast-fw" style="margin-left:2px;"></i></a>\
	    </div>\
	    <div class="fwdock-volume-controls">\
		<div class="fw-volume-bar-container">\
			<a data-bind="visible: !music.muted()" href="javascript:;" class="fw-mute" tabindex="1"><i class="flexicon-volume-up"></i></a>\
			<a data-bind="visible: music.muted()" href="javascript:;" class="fw-unmute" tabindex="1"><i class="flexicon-volume-down"></i></a>\
			<div class="fw-volume-bar">\
				<div class="fw-volume-bar-value">\
					<div class="bullet"></div>\
				</div>\
			</div>\
		</div>\
	    </div>\
	    <div class="fwdock-nowplaying-info">\
	     <div data-bind="visible: nowplaying().nid > 0" style="display:none">\
	      <img class="fwdock-nowplaying-image" data-bind="click: music.showLicenseOptions, visible: nowplaying().nid > 0, attr: { src: nowplaying().thumbnail }" style="display:none" />\
	      <div class="fwdock-addtocart" data-bind="click: music.showLicenseOptions"><i title="Purchase Options" data-delay="500" class="fwicon-dollar show-tooltip"></i></div>\
	      <div class="fwdock-progressbar" data-bbflex="widget: \'progressbar\'" style="height:12px; width:215px;"></div>\
	      <div class="fwdock-nowplaying-music">\
		<div style="cursor:pointer" class="title" data-bind="html: nowplaying().title, click: music.showLicenseOptions"></div>\
		<div class="artist" data-bind="html: nowplaying().artist"></div>\
	      </div>\
	      <div data-bind="visible: app.settings.bootmode != \'disabled\'" class="fwdock-side-buttons">\
		<i title="Launch Fullscreen" data-delay="500" data-toggle="tooltip" class="fwicon-resize-full show-tooltip"></i>\
	      </div>\
	     </div>\
	    </div>\
	    <div class="fwdock-command-options">\
	      <a href="javascript:;" class="fwdock-button fwdock-playlist-menu medium white circle slide-toggle"><i title="Playlist Menu" class="fwicon-align-justify" style="margin:8px 0 0 0;"></i></a>\
	      <div data-bind="click: cart.show" class="fwdock-command-cart">\
		<div class="items-count"><i class="fwicon-basket"></i> <span data-bind="html: cart().items.length + \' Items\'"></div>\
		<div class="items-total" data-bind="html: \'$\' + cart().total"></div>\
	      </div>\
	      <div class="items-checkout" data-bind="visible: cart().items.length > 0" style="display:none"><a data-bind="click: cart.checkout" class="fwdock-button fwdock-checkout-button medium green rounded">Checkout</a></div>\
	    </div>\
	  </div>\
	  ';
        },
        init: function (template, widget, settings) {

            myApp.Music.addInterface(widget.find(".fwdock-music-buttons,.fwdock-volume-controls"), $.bbflex.config.fw_interface);

            widget.find('.fwdock-button').click(function () {
                this.blur();
            });
            widget.find('.show-tooltip').tooltip();
            widget.find('.fwicon-resize-full').click(function () {
                myApp.fullScreen();
            });
            widget.find('.fwdock-button.slide-toggle').click(function () {
                widget.find(this).toggleClass('black white');
                widget.find(this).hasClass('black') ? widget.find('.fwdock-playlist-container').animate({ height: 230 }) : widget.find('.fwdock-playlist-container').animate({ height: 0 });
            });

        }

    });

});