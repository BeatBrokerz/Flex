flexloader.extendApp(function ($, myApp, config) {

    if (config.autoload) {
        flexloader.addCSS(config.script.basepath + "widget.css");
    }

    myApp.addWidget('fwplayer', {

        html: function (template, settings) {

            var defaultSettings = $.extend({
                fullscreen: true
            }, settings);

            return '\
	   <div class="flex-player-cart-container">\
	     <div class="flex-player-cart-container-inner">\
	     <div class="cart-summary-wrap">\
	       <span class="cart-totals">\
	         <i class="fwicon-basket"></i> <span data-bind="text: flexStore.Cart.data().items.length"></span> Items: \
	         $<span data-bind="text: flexStore.Cart.data().total"></span> \
	       </span>\
	       <span class="cart-checkout">\
	         <button onclick="flexStore.Cart.checkout();" class="cart-checkout-button btn btn-success btn-xs">\
		   <span class="cart-checkout-button-text"><i class="fwicon-right-circled"></i> Checkout</span>\
		 </button>\
	       </span>\
	     </div>\
	     </div>\
	     <div class="cart-list-wrap">\
	       <div data-bbflex="widget: \'cart\', width: \'100%\', height: \'100%\', scroll: true"></div>\
	     </div>\
	   </div>\
	   <div class="table-row preview">\
		<div class="table-cell fw-preview-area">\
		    <div class="fw-content-image">\
		      <img data-bind="{ attr: { src: nowplaying().image }, visible: nowplaying().image }" />\
		    </div>\
		    <div class="fw-content fw-content-nowplaying fw-outer-content reserved">\
		      <div class="table"><div class="table-row"><div class="table-cell">\
			<div class="fw-nowplaying-producer" data-bind="html: nowplaying().artist"></div>\
			<div class="fw-nowplaying-songname" data-bind="html: nowplaying().title"></div>\
			<div class="fw-nowplaying-genres" data-bind="html: nowplaying().genres"></div>\
		      </div></div></div>\
		    </div>\
		    <div class="fw-content-buttons">\
		      <div class="fw-button-tab nowplaying"><a content-div="fw-content-nowplaying" class="jp-button fw-button fw-button-nowplaying active" href="javascript:;"><i class="fwicon-info"></i><span class="button-text"> Now Playing</span></a></div>\
		      <div class="fw-button-tab playlist"><a content-div="fw-content-playlist" class="jp-button fw-button fw-button-playlist" href="javascript:;"><i class="fwicon-music"></i><span class="button-text"> Full Playlist</span></a></div>\
		      <div class="fw-button-tab buynow"><a content-div="fw-content-buynow" class="jp-button fw-button fw-button-buynow" href="javascript:;"><i class="fwicon-dollar"></i><span class="button-text"> Buy Now</a></span></div>\
		    </div>\
		    <div class="fw-content-div fw-inner-content">\
		      <div class="fw-content fw-content-playlist">\
			<div data-bbflex="widget: \'playlist\', scroll: true"></div>\
		      </div>\
		      <div class="fw-content fw-content-nowplaying active">\
		        <div class="table"><div class="table-row"><div class="table-cell">\
			  <div class="fw-nowplaying-producer" data-bind="html: nowplaying().artist"></div>\
			  <div class="fw-nowplaying-songname" data-bind="html: nowplaying().title"></div>\
			  <div class="fw-nowplaying-genres" data-bind="html: nowplaying().genres"></div>\
			</div></div></div>\
		      </div>\
		      <div class="fw-content fw-content-buynow">\
			   <div data-bbflex="widget: \'licensing\', scroll: true"></div>\
		      </div>\
		    </div>\
		</div>\
	   </div>\
	   <div class="table-row controls">\
		<div class="table-cell controls">\
			<div data-bbflex="widget: \'playbar\', fullscreen: ' + (defaultSettings.fullscreen ? 'true' : 'false') + '"></div>\
		</div>\
	   </div>\
	';
        },
        init: function (template, widget, settings) {

            var width = settings.width || widget.width() || 620;
            var height = settings.height || widget.height() || 150;

            if (!template.getLayout(template, width, height, height - 35)) {
                // no template to fit size, what to do now.... ?
            }

            width = width < 125 ? 125 : width;
            height = height < 125 ? 125 : height;

            widget.css({width: width, height: height});

            var cartDiv = widget.find('.flex-player-cart-container');

            switch (settings.cart) {
                case 'top':
                    cartDiv.removeClass('bottom').addClass('top');
                    break;
                case 'off':
                    cartDiv.css('display', 'none');
                    widget.find('.fw-button-tab.buynow').css('display', 'none');
                    break;
                case 'bottom':
                default:
                    cartDiv.removeClass('top').addClass('bottom');
            }

            // initialize tabs
            widget.find('.fw-button-tab .fw-button').click(function () {
                var tab = $(this);
                if (!tab.hasClass('active')) {
                    var content = widget.find('.' + tab.attr('content-div'));

                    // Transition out the currently active tab content
                    widget.find('.fw-button-tab .active').each(function () {
                        var $tab = $(this); // previous tab
                        var $content = widget.find('.fw-content-div .' + $tab.attr('content-div')); // previous content
                        $tab.removeClass('active');
                        $content.animate({ left: $content.width() * -1 },function () {
                            $(this).css({ left: -10000 })
                        }).removeClass('active');
                    });

                    // transition in the newly active tab content
                    tab.addClass('active');
                    content.css({ left: content.width() });
                    content.addClass('active').animate({ left: 0 });
                }
            });

            // hide non-active tab content
            widget.find('.fw-content-div .fw-content').not('.active').each(function () {
                $(this).css({ left: -10000 });
            });

            // adjust widget size
            template.adjustSize(template, widget, settings);

            widget.find('.cart-totals').click(function () {
                cartDiv.toggleClass('full');
            });

            var updateWidgetCart = function (cart) {
                cart.items && cart.items.length ?
                    cartDiv.addClass('visible')
                    : cartDiv.removeClass('full visible');
            };

            myApp.on('bbflex-cart-updated', updateWidgetCart);
            updateWidgetCart(myApp.Cart.data());

        },
        getLayout: function (template, width, height, ratioHeight) {
            for (var i in template.layouts) {
                var layout = template.layouts[i];
                if (layout.min && layout.min.width !== undefined && width < layout.min.width) continue;
                if (layout.min && layout.min.height !== undefined && height < layout.min.height) continue;
                if (layout.min && layout.min.ratio !== undefined && width / ratioHeight < layout.min.ratio) continue;
                if (layout.max && layout.max.width !== undefined && width > layout.max.width) continue;
                if (layout.max && layout.max.height !== undefined && height > layout.max.height) continue;
                if (layout.max && layout.max.ratio !== undefined && width / ratioHeight > layout.max.ratio) continue;
                return layout;
            }
            console.log('No player template found to display this size (' + width + 'x' + height + ')!');
            if (typeof alertify !== 'undefined') {
                alertify.error('The fwplayer widget does not have a display designed for the chosen size: (' + width + 'x' + height + ')');
            }
            return false;
        },
        adjustSize: function (template, widget, settings) {

            // reset all table cell dimensions on widget since tables don't always play nice with size
            widget.find('.table-cell').css({ width: '', height: '' });

            settings = $.extend({
                showPlaylist: true,
                showLicensing: true,
                showButtons: true,
                showImage: true,
                contentMargin: 5
            }, settings);

            var prvwHeight = widget.height() - 35;

            settings.dimensions = {
                wdgtWidth: widget.width(),
                wdgtHeight: widget.height(),
                ctlsHeight: 35,
                prvwHeight: prvwHeight
            }

            var layout = template.getLayout(template, settings.dimensions.wdgtWidth, settings.dimensions.wdgtHeight, settings.dimensions.prvwHeight);

            if (layout) {
                // we have a qualified template!
                widget.removeClass('iconic inline-buttons detach-songinfo');
                var prepared = layout.prepare(widget, settings);
            }

            if (typeof prepared === 'undefined') return false;

            $.bbflex.widgets.playbar.adjustSize({}, widget, {});

            // tell css if our content area is compressed
            if (prepared.content.width < 160 || prepared.content.height < 75) {
                widget.addClass('reduced-content-size');
            } else {
                widget.removeClass('reduced-content-size');
            }

            // tell css if our detached songinfo area is compressed
            if (typeof prepared.songinfo !== 'undefined') {
                if (prepared.songinfo.width < 160 || prepared.songinfo.height < 75) {
                    widget.addClass('reduced-songinfo-size');
                } else {
                    widget.removeClass('reduced-songinfo-size');
                }
            }

            // tell css if our content area has a liberal width
            if (prepared.content.width >= 260) {
                widget.addClass('liberal-content-width');
            } else {
                widget.removeClass('liberal-content-width');
            }

            prepared.image.width = prepared.image.height = prepared.image.size;
            delete prepared.image.size;

            widget.find('.fw-preview-area').css({ height: settings.dimensions.prvwHeight, overflow: 'hidden' });
            widget.find('.fw-content-buttons').css(prepared.buttons);
            widget.find('.fw-content-image').css(prepared.image);
            widget.find('.fw-content-div').css(prepared.content);
            if (prepared.songinfo) widget.find('.fw-content-nowplaying.reserved').css(prepared.songinfo);

            return true;

        },
        layouts: {

            // a standard range of sizes
            standard: {
                min: { width: 180, height: 125, ratio: 2 },
                max: { height: 295 },
                prepare: function (widget, s) {

                    var d = s.dimensions;
                    var w = {  			// default widget configuration
                        image: { size: 0, display: '', left: s.contentMargin, top: s.contentMargin, right: '', bottom: '' },
                        content: { left: '', right: '', top: s.contentMargin, bottom: '' },
                        buttons: { right: '', top: '' }
                    };

                    var viewRatio = d.wdgtWidth / d.prvwHeight;
                    var btns = widget.find('.fw-content-buttons');
                    var pad = function (value) {
                        value = value || 0;
                        return value + (s.contentMargin * 2);
                    }
                    var indent = function (value) {
                        value = value || 0;
                        return value + s.contentMargin;
                    }

                    // make image full height of preview area
                    w.image.size = d.prvwHeight - pad();
                    w.content.width = d.wdgtWidth - (pad(w.image.size)) - pad();

                    // if the content div has a decent width, we have room to show the buttons to the right and favor content div height
                    if (w.content.width > 160) {
                        w.content.height = d.prvwHeight - pad();

                        // only if the content div has an abundance of width and lack of height do we show the buttons inline with the content and with button text too!
                        if (w.content.width - widget.removeClass('iconic').find('.fw-content-buttons').width() >= 160 && viewRatio >= 2.5 && d.wdgtHeight <= 200) {
                            w.content.width -= pad(btns.width());
                            w.content.left = pad(w.image.size);
                            //w.buttons.top = w.content.height > btns.height() ? parseInt((pad(w.content.height) - btns.height()) / 2) : ''; // center buttons vertical
                        }

                        // otherwise, we'll choose between stacked content/buttons or inline content/buttons
                        else {
                            widget.addClass('iconic');
                            // stacked for taller widgets
                            if (viewRatio < 2.5 || d.wdgtHeight > 200) {
                                // do the buttons fit with full text too?
                                if (widget.addClass('inline-buttons').removeClass('iconic').find('.fw-content-buttons').width() > w.content.width) {
                                    widget.addClass('iconic');
                                }
                                w.content.height -= pad(btns.height());
                                w.content.left = pad(w.image.size);
                                w.buttons.top = pad(w.content.height);
                                w.buttons.right = parseInt((pad(w.content.width) - btns.width()) / 2); // center buttons horizontal
                            }
                            // still on the side for wider widgets
                            else {
                                w.content.width -= pad(btns.width());
                                w.content.left = pad(w.image.size);
                                w.buttons.right = 5;
                                w.buttons.top = 5;
                                //w.buttons.top = w.content.height > btns.height() ? parseInt((pad(w.content.height) - btns.height()) / 2) : ''; // center buttons vertical
                            }
                        }
                    }
                    // otherwise, the content div is still not very wide, so we will stack it with the buttons to favor width
                    else {
                        widget.addClass('iconic inline-buttons'); // make the buttons icons only, and inline
                        w.content.height = d.prvwHeight - pad(btns.height()) - indent();
                        w.content.left = pad(w.image.size);
                        w.buttons.right = parseInt((pad(w.content.width) - btns.width()) / 2); // center buttons horizontal
                        w.buttons.top = pad(w.content.height);
                    }


                    return w;

                }

            },

            // you like em skinny and tall?
            thin: {
                min: { width: 125, height: 125 },
                max: { width: 200 },
                prepare: function (widget, s) {

                    var d = s.dimensions;
                    var w = {  			// default widget configuration
                        image: { size: 0, display: '', left: s.contentMargin, top: s.contentMargin, right: '', bottom: '' },
                        content: { left: s.contentMargin, top: '' },
                        buttons: { right: '', top: '' },
                        songinfo: {}
                    };

                    var viewRatio = d.wdgtWidth / d.prvwHeight;
                    var btns = widget.find('.fw-content-buttons');
                    var pad = function (value) {
                        value = value || 0;
                        return value + (s.contentMargin * 2);
                    }
                    var indent = function (value) {
                        value = value || 0;
                        return value + s.contentMargin;
                    }

                    widget.addClass('iconic inline-buttons'); // always use inline icon buttons for this widget

                    w.content.width = d.wdgtWidth - pad();

                    // less than -x- px tall and we sacrifice the image
                    if (d.wdgtHeight < 175) {
                        w.image.display = 'none';
                        w.content.height = d.prvwHeight - pad(btns.height());

                        // otherwise, show the image
                    } else {

                        // incrementally enlarge the image until it gets to max width of widget
                        w.image.size = widget.height() - 130;
                        w.image.size = w.image.size > widget.width() - pad() ? widget.width() - pad() : w.image.size;

                        w.image.left = parseInt((d.wdgtWidth - w.image.size) / 2); // center image horizontally
                        w.content.height = d.prvwHeight - pad(w.image.size) - pad(btns.height());
                        w.content.top = pad(w.image.size);

                    }

                    // now, if we are starting to grow very tall, detach the static songinfo and show the playlist to take up space
                    if (w.content.height - indent(55) >= 55) {
                        w.songinfo.left = indent();
                        w.songinfo.top = w.content.top;
                        w.songinfo.width = w.content.width;
                        w.songinfo.height = 55;
                        widget.addClass('detach-songinfo');
                        widget.find('.fw-button-tab .fw-button-playlist').click();
                        w.buttons.top = pad(w.image.size) + indent(55);
                        w.content.height = w.content.height - indent(55);
                        w.content.top = w.content.top + indent(55) + indent(btns.height());
                    }

                    // we're not awkwardly tall, so nothing special...
                    else {
                        w.content.top = pad(w.image.size) + btns.height();
                        w.buttons.top = pad(w.image.size);
                    }

                    w.buttons.right = parseInt((w.content.width - btns.width()) / 2); // center buttons horizontal

                    return w;

                },
            },

            // a more squareish approach
            plump: {
                min: { width: 200, height: 200 },
                max: { ratio: 2 },
                prepare: function (widget, s) {

                    var d = s.dimensions;
                    var w = {  			// default widget configuration
                        image: { size: 0, display: '', left: s.contentMargin, top: s.contentMargin, right: '', bottom: '' },
                        content: { left: s.contentMargin, top: '' },
                        buttons: { right: '', top: '' },
                        songinfo: {}
                    };

                    var viewRatio = d.wdgtWidth / d.prvwHeight;
                    var btns = widget.find('.fw-content-buttons');
                    var pad = function (value) {
                        value = value || 0;
                        return value + (s.contentMargin * 2);
                    }
                    var indent = function (value) {
                        value = value || 0;
                        return value + s.contentMargin;
                    }

                    widget.addClass('detach-songinfo inline-buttons');
                    widget.find('.fw-button-tab .fw-button-playlist').click();

                    // image is either half of the height, or half of the width, with a maximum of 250
                    w.image.size = viewRatio > 1 ? parseInt(d.prvwHeight / 2) - pad() : parseInt(d.wdgtWidth / 2) - pad();
                    w.image.size = w.image.size > 250 ? 250 : w.image.size;

                    w.songinfo.left = pad(w.image.size);
                    w.songinfo.width = d.wdgtWidth - pad(w.image.size) - indent();
                    w.songinfo.top = indent();
                    w.songinfo.height = w.image.size;

                    // put buttons under songinfo at full width if there is enough room
                    if (w.songinfo.width >= widget.removeClass('iconic').find('.fw-content-buttons').width()) {
                    }
                    else {
                        widget.addClass('iconic');
                    }

                    w.songinfo.height -= pad(btns.height());
                    w.buttons.top = pad(w.songinfo.height);
                    w.content.width = d.wdgtWidth - pad();
                    w.content.height = d.prvwHeight - pad(w.image.size) - indent();
                    w.content.top = pad(w.image.size);
                    w.buttons.right = parseInt((w.songinfo.width - btns.width()) / 2); // center buttons horizontal

                    return w;

                },
            }

        }

    });

});