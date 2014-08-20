/**
 * Modified version of head.js v1.0.3
 * Loaded into the "flexloader" namespace.
 */
(function(e,t){"use strict";function g(){}function y(e,t){if(!e){return}if(typeof e==="object"){e=[].slice.call(e)}for(var n=0,r=e.length;n<r;n++){t.call(e,e[n],n)}}function b(e,n){var r=Object.prototype.toString.call(n).slice(8,-1);return n!==t&&n!==null&&r===e}function w(e){return b("Function",e)}function E(e){return b("Array",e)}function S(e){var t=e.split("/"),n=t[t.length-1],r=n.indexOf("?");return r!==-1?n.substring(0,r):n}function x(e){e=e||g;if(e._done){return}e();e._done=1}function T(e,t,n,r){var i=typeof e==="object"?e:{test:e,success:!!t?E(t)?t:[t]:false,failure:!!n?E(n)?n:[n]:false,callback:r||g};var s=!!i.test;if(s&&!!i.success){i.success.push(i.callback);h.load.apply(null,i.success)}else if(!s&&!!i.failure){i.failure.push(i.callback);h.load.apply(null,i.failure)}else{r()}return h}function N(e){var t={};if(typeof e==="object"){for(var n in e){if(!!e[n]){t={name:n,url:e[n]}}}}else{t={name:S(e),url:e}}var r=u[t.name];if(r&&r.url===t.url){return r}t.loadQueIndex=o.length;o.push(t.name);u[t.name]=t;return t}function C(e){e=e||u;for(var t in e){if(e.hasOwnProperty(t)&&e[t].state!==m){return false}}return true}function k(e){e.state=d;y(e.onpreload,function(e){e.call()})}function L(e,n){if(e.state===t){e.state=p;e.onpreload=[];D({url:e.url,type:"cache"},function(){k(e)})}}function A(){var e=arguments,t=e[e.length-1],n=[].slice.call(e,1),r=n[0];if(!w(t)){t=null}if(E(e[0])){e[0].push(t);h.load.apply(null,e[0]);return h}var i=N(e[0]);if(i.loadQueIndex==l){y(s[i.name],function(e){x(e)})}if(!!r){var o={};y(n,function(e){if(!w(e)&&!!e){e=N(e);L(e);o[e.name]=e}});M(i,w(r)?r:function(){y(n,function(e){if(!w(e)&&!!e){e=N(e);M(e,function(){if(t&&C(o)){x(t)}})}})})}else{M(i)}return h}function O(){var e=arguments,t=e[e.length-1],n={};if(!w(t)){t=null}if(E(e[0])){e[0].push(t);h.load.apply(null,e[0]);return h}var r=N(e[0]);if(r.loadQueIndex==l){y(s[r.name],function(e){x(e)})}y(e,function(e,r){if(e!==t){e=N(e);n[e.name]=e}});y(e,function(e,r){if(e!==t){e=N(e);M(e,function(){if(C(n)){x(t)}})}});return h}function M(e,t){t=t||g;if(e.state===m){t();return}if(e.state===v){h.ready(e.name,t);return}if(e.state===p){e.onpreload.push(function(){M(e,t)});return}e.state=v;D(e,function(){e.state=m;t();y(i[e.name],function(e){x(e)});l++;var n=o[e.loadQueIndex+1];if(n){y(s[n],function(e){x(e)})}if(f&&C()){y(i.ALL,function(e){x(e)})}})}function _(e){e=e||"";var t=e.split("?")[0].split(".");return t[t.length-1].toLowerCase()}function D(t,r){function i(t){t=t||e.event;u.onload=u.onreadystatechange=u.onerror=null;r()}function s(i){i=i||e.event;if(i.type==="load"||/loaded|complete/.test(u.readyState)&&(!n.documentMode||n.documentMode<9)){e.clearTimeout(t.errorTimeout);e.clearTimeout(t.cssTimeout);u.onload=u.onreadystatechange=u.onerror=null;r()}}function o(){if(t.state!==m&&t.cssRetries<=20){for(var r=0,i=n.styleSheets.length;r<i;r++){if(n.styleSheets[r].href===u.href){s({type:"load"});return}}t.cssRetries++;t.cssTimeout=e.setTimeout(o,250)}}r=r||g;var u;var a=_(t.url);if(a==="css"){u=n.createElement("link");u.type="text/"+(t.type||"css");u.rel="stylesheet";u.href=t.url;t.cssRetries=0;t.cssTimeout=e.setTimeout(o,500)}else{u=n.createElement("script");u.type="text/"+(t.type||"javascript");u.src=t.url}u.onload=u.onreadystatechange=s;u.onerror=i;u.async=false;u.defer=false;t.errorTimeout=e.setTimeout(function(){i({type:"timeout"})},7e3);var f=n.head||n.getElementsByTagName("head")[0];f.insertBefore(u,f.lastChild)}function P(){var e=n.getElementsByTagName("script");for(var t=0,r=e.length;t<r;t++){var i=e[t].getAttribute("data-headjs-load");if(!!i){h.load(i);return}}}function H(e,t){if(e===n){if(f){x(t)}else{r.push(t)}return h}if(w(e)){t=e;e="ALL"}if(E(e)){var s={};y(e,function(e){s[e]=u[e];h.ready(e,function(){if(C(s)){x(t)}})});return h}if(typeof e!=="string"||!w(t)){return h}var o=u[e];if(o&&o.state===m||e==="ALL"&&C()&&f){x(t);return h}if(!i[e]){i[e]=[t]}else{i[e].push(t)}return h}function B(e,t){if(typeof e!=="string"||!w(t)){return h}var n=u[e];if(n&&n.state===m){return h}if(!s[e]){s[e]=[t]}else{s[e].push(t)}return h}function j(){if(!n.body){e.clearTimeout(h.readyTimeout);h.readyTimeout=e.setTimeout(j,50);return}if(!f){f=true;P();y(r,function(e){x(e)})}}function F(){if(n.addEventListener){n.removeEventListener("DOMContentLoaded",F,false);j()}else if(n.readyState==="complete"){n.detachEvent("onreadystatechange",F);j()}}var n=e.document,r=[],i={},s={},o=[],u={},a="async"in n.createElement("script")||"MozAppearance"in n.documentElement.style||e.opera,f,l=0,c="flexloader",h=e[c]=e[c]||function(){h.ready.apply(null,arguments)},p=1,d=2,v=3,m=4;if(n.readyState==="complete"){j()}else if(n.addEventListener){n.addEventListener("DOMContentLoaded",F,false);e.addEventListener("load",j,false)}else{n.attachEvent("onreadystatechange",F);e.attachEvent("onload",j);var I=false;try{I=!e.frameElement&&n.documentElement}catch(q){}if(I&&I.doScroll){(function R(){if(!f){try{I.doScroll("left")}catch(t){e.clearTimeout(h.readyTimeout);h.readyTimeout=e.setTimeout(R,50);return}j()}})()}}h.load=h.js=a?O:A;h.test=T;h.ready=H;h.before=B;h.ready(n,function(){if(C()){y(i.ALL,function(e){x(e)})}if(h.feature){h.feature("domloaded",true)}})})(window)
/**
 * @var coreVer
 * @type string A property that we can override to ensure the latest release of resources are loaded
 */
flexloader.coreVer = '1.0.0';

/**
 * Priority Init: Put our reservation in to execute functions passed to extendApp()
 * before any other "ready" handlers which are attached to our loader via ready() or execute().
 */
flexloader.ready(function () {
    if (flexloader.priorityInit) {
        flexloader.priorityInit();
    }
});

/**
 * Framework Resources List
 *
 * @type object A list of resources that our core framework uses.
 *
 */
flexloader.flexApp = {
    resources: {
        jquery: {
            missing: function () {
                var minVersion = function(version) {
                    var $vrs = jQuery.fn.jquery.split('.'),
                        min = version.split('.'),
                        prevs=[];

                    for (var i=0, len=$vrs.length; i<len; i++) {
                        if (min[i] && $vrs[i] < min[i]) {
                            if (!prevs[i-1] || prevs[i-1] == 0)
                                return false;
                        } else {
                            if ($vrs[i] > min[i])
                                prevs[i] = 1;
                            else
                                prevs[i] = 0;
                        }
                    }
                    return true;
                }
                flexloader.jqConflict = false;
                if (typeof jQuery === 'undefined' || !minVersion('1.8')) {
                    flexloader.jqConflict = typeof jQuery !== 'undefined' ? true : false;
                    return true;
                }
            },
            src: "//www.beatbrokerz.com/flex/js/jquery.min.js",
            ready: function() {
                flexloader.jq = jQuery;
            },
            core: true
        },
        jqueryform: {
            missing: function () {
                return typeof jQuery !== 'function' || typeof jQuery.fn.ajaxForm !== 'function' || flexloader.jqConflict;
            },
            src: "//www.beatbrokerz.com/flex/js/jquery.form.min.js",
            core: true
        },
        cookie: {
            missing: function () {
                return typeof jQuery !== 'function' || typeof jQuery.cookie !== 'function' || flexloader.jqConflict;
            },
            src: "//www.beatbrokerz.com/flex/js/jquery.cookie.js",
            core: true
        },
        jplayer: {
            missing: function () {
                return typeof jQuery !== 'function' || typeof jQuery.jPlayer !== 'function' || flexloader.jqConflict;
            },
            src: "//www.beatbrokerz.com/flex/js/jquery.jplayer.js",
            core: true
        },
        jplaylist: {
            missing: function () {
                return typeof jPlayerPlaylist !== 'function' || flexloader.jqConflict;
            },
            src: "//www.beatbrokerz.com/flex/js/jplayer.playlist.js",
            core: true
        },
        knockout: {
            missing: function () {
                return typeof ko === 'undefined';
            },
            src: "//www.beatbrokerz.com/flex/js/knockout.core.js",
            ready: function() {
                ko.bindingHandlers.bindShield = {
                    init: function() { return { controlsDescendantBindings: true }; }
                };
                flexloader.jq.ko = ko;
            },
            core: true
        },
        bbflex: {
            missing: function () {
                flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/fw.common.css', core: true }));
                return typeof jQuery !== 'function' || typeof jQuery.bbflex !== 'function' || flexloader.jqConflict;
            },
            src: '//www.beatbrokerz.com/flex/js/jquery.bbflex.js',
            core: true
        }
    }
};

/**
 * Mobile App Resources List
 *
 * @type object A list of resources that our framework uses to build mobile interfaces
 *
 */
flexloader.mobileApp = {
    resources: {
        css: {
            missing: function () {
                flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/dx.common.css', core: true }));
                return false;
            }
        },
        globalize: {
            missing: function () {
                return typeof Globalize === 'undefined';
            },
            src: "//www.beatbrokerz.com/flex/js/globalize.min.js",
            core: true
        },
        phonejs: {
            missing: function () {
                return typeof DevExpress === 'undefined';
            },
            src: "//www.beatbrokerz.com/flex/js/dx.phonejs.js",
            core: true,
            ready: function () {
                var device = DevExpress.devices.current();
                switch (device.platform) {
                    case 'desktop':
                        flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/dx.desktop.default.css', core: true }));
                        break;
                    case 'ios':
                        flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/dx.ios.default.css', core: true }));
                        break;
                    case 'android':
                        flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/dx.android.holo-dark.css', core: true }));
                        break;
                    case 'win8':
                        flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/css/dx.win8.black.small.css', core: true }));
                        break;
                }
            }
        }
    }
};

/**
 * Framework Initialization
 *
 * Loads the framework in a non-blocking way (using the head.js implementation)
 *
 * This method accepts any number of resources objects as parameters. It also accepts an optional function
 * as a final parameter which will be added to the "ready" handler stack, and executed once all resources
 * are ready.
 *
 * Example:
 * flexloader.init(resourceObj1, resourceObj2, function() { alert('Framework Ready!'); });
 *
 */
flexloader.init = function () {

    var dependencies = [];
    flexloader.initialized = true;

    // Initialize our namespace if we are loading an app
    if (typeof myAppNamespace === 'string') {
        window[myAppNamespace] = window[myAppNamespace] || {};
        flexloader.priorityInit = function () {
            flexloader.loadExtensions();
            flexloader.loaded = true;
        }
        flexloader.ready(function () {
            if (typeof window[myAppNamespace].launch === 'function') {
                window[myAppNamespace].launch();
            }
        });
    }

    for (var j = 0; j < arguments.length; j++) {
        var resources = arguments[j];
        if (typeof resources === 'function') {
            var func = resources;
            continue;
        }
        for (var i in resources) {
            var resource = resources[i];
            if (typeof resource.missing === 'undefined' || resource.missing()) {
                var _res = {};
                _res[i] = flexloader.src(resource);
                dependencies.push(_res);
                if (typeof resource.before === 'function') {
                    flexloader.before(i, resource.before);
                }
                if (typeof resource.ready === 'function') {
                    flexloader.ready(i, resource.ready);
                }
            }
            else {
                if (typeof resource.ready === 'function') {
                    resource.ready();
                }
            }
        }
    }

    func = func || function () {
    };

    flexloader.ready(function () {
        if (flexloader.jqConflict) {
            jQuery.noConflict(true);
            /* PhoneJS passes $.isPlainObject to a knockout template binding internally,
             so we need to retrofit this method to older versions of jQuery */
            if ($ && typeof $.isPlainObject !== 'function') {
                $.isPlainObject = flexloader.jq.isPlainObject;
            }
            else {
                $ = { isPlainObject: flexloader.jq.isPlainObject };
            }
        }
        func();
    });

    flexloader.load.apply(this, dependencies);

}

/**
 * URL Generator
 *
 * Convenience method to add our current framework version to a resource URL.
 *
 * @param resource
 * @type object {
 *   src: (string)     // url to the resource to load
 *   core: (boolean)   // boolean flag which indicates whether this resource is packaged with core
 * }
 * @returns string The url to the resource (with appropriate version param for core resources)
 */
flexloader.src = function (resource) {
    if (resource.src.indexOf('//') == 0) {
        resource.src = ('https:' == document.location.protocol ? 'https:' : 'http:') + resource.src;
    }
    if (resource.core) {
        return resource.src.indexOf('?') >= 0 ? resource.src + '&core=' + flexloader.coreVer : resource.src + '?core=' + flexloader.coreVer;
    }

    return resource.src;
}

/**
 * Components To Resources Converter
 *
 * Puts together resources from a components list. This method is not a public method and is only used
 * for internal Beat Brokerz framework setup.
 *
 * @param components object A components object
 * @returns object A resources object that can be passed to the flexloader.init() method
 */
flexloader.resources = function (components) {
    var resources = {};
    for (var resource in components) {
        for (var i = 0; i < components[resource].length; i++) {
            var module = components[resource][i];
            resources[module] = {
                missing: function () {
                    return true;
                },
                src: "//www.beatbrokerz.com/flex/" + resource + "/" + module + "/" + module + ".js",
                core: true
            };
            flexloader.addCSS(flexloader.src({ src: '//www.beatbrokerz.com/flex/' + resource + '/' + module + '/' + module + '.css', core: true }));
            flexloader.xd ?
                flexloader.addTemplate(flexloader.src({ src: '//www.beatbrokerz.com/flex/' + resource + '/' + module + '/template.php', core: true })) :
                flexloader.addTemplate(flexloader.src({ src: '/flex/' + resource + '/' + module + '/' + module + '.html', core: true }));
        }
    }
    return resources;
};

/**
 * Add Resource
 *
 * Adds a resource (javascript/css) to be loaded by our asynchrounous loader. The resource object can
 * have a number of properties:
 * {
 *   src: '/url/to/resource.ext',   // required. the url to the resource to load
 *   name: 'identifier',            // optional. internal name for the resource
 *   before: function() {},         // optional. a function to execute just before the resource is loaded
 *   ready: function() {}           // optional. a function to execute just after the resource is ready
 * }
 *
 * @param name string/object    A string value here will act as an internal name for the resource so that functions
 *                              can be attached to it's ready() event. E.g. "flexloader.ready('name', function() {});".
 *                              Otherwise, this can just be a resource object and the name will be inferred from the object.
 *
 * @param resource object       If a second parameter is passed to this method, it should always be a resource
 *                              object. Any name provided in the resource object will be overridden by the name
 *                              passed as the first parameter to this method.
 *
 */
flexloader.addResource = function (name, resource) {
    if (typeof name === 'object') {
        resource = name;
        name = resource.name || resource.src;
    }
    if (flexloader.initialized && !flexloader.flexApp.resources[name]) {
        if (typeof resource.missing === 'undefined' || resource.missing()) {
            if (typeof resource.ready === 'function') {
                flexloader.ready(name, resource.ready);
            }
            if (typeof resource.before === 'function') {
                flexloader.before(name, resource.before);
            }
            var _res = {};
            _res[name] = flexloader.src(resource);
            flexloader.load(_res);
        }
        else {
            if (typeof resource.ready === 'function') {
                resource.ready();
            }
        }
    }
    flexloader.flexApp.resources[name] = resource;
}


/**
 * Add Multiple Resources
 *
 * This method allows us to package multiple resources into a single object and add them all at once.
 * When packaging resources, use the following format for the containing object:
 * {
 *   'resourceName1' : { .. resource object .. },
 *   'resourceName2' : { .. resource object .. }
 * }
 *
 * @param resources object A packaged resources object
 */
flexloader.addResources = function (resources) {
    for (var resource in resources) {
        flexloader.addResource(resource, resources[resource]);
    }
}

// used to add a css file to the document
flexloader.addCSS = function (css) {

    if (!css) return;
    var head = document.getElementsByTagName('head')[0];

    // ensure an object
    if (typeof css == 'string') {
        css = { href: css, media: 'all' };
    }

    if (css.href) {
        var stylesheet = document.createElement('link');
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.setAttribute('media', css.media || 'all');
        stylesheet.setAttribute('href', css.href);
        head.appendChild(stylesheet);
    }
    if (css.text) {
        var stylesheet = document.createElement('style');
        stylesheet.setAttribute('type', 'text/css');
        stylesheet.setAttribute('media', css.media || 'all');
        stylesheet.styleSheet ?
            stylesheet.styleSheet.cssText = css.text :
            stylesheet.appendChild(document.createTextNode(css.text));
        head.appendChild(stylesheet);
    }

}

// add a template to the document
flexloader.addTemplate = function (href) {

    if (!href) return;
    var head = document.getElementsByTagName('head')[0];

    if (!flexloader.xd) {
        var template = document.createElement('link');
        template.setAttribute('rel', 'dx-template');
        template.setAttribute('type', 'text/html');
        template.setAttribute('href', href);
        head.appendChild(template);
    }
    else {
        var template = document.createElement('script');
        template.setAttribute('type', 'text/javascript');
        template.setAttribute('src', href);
        head.appendChild(template);
    }

}

// Storage container for our extensions
flexloader.extensions = [];

// Handler for our extensions
flexloader.extendApp = function (func) {
    if (flexloader.loaded && !flexloader.autoload.loading) {
        flexloader.execute(func, {});
    }
    else {
        flexloader.extensions.push({
            callback: func,
            config: {}
        });
    }
}

// Load any extensions in our loading queue
flexloader.loadExtensions = function() {
    if (flexloader.initialized) {
        var $ = flexloader.jq;
        $.each(flexloader.extensions, function (i, extend) {
            extend.callback($, window[myAppNamespace], extend.config);
        });
        flexloader.extensions = [];
    }
}

// execute a function in the context of the application
flexloader.execute = function (name, func, config) {
    if (typeof name === 'function') {
        func = name;
        config = func;
        name = undefined;
    }
    config = config || {};
    var context = function () {
        var myApp = myAppNamespace ? window[myAppNamespace] : undefined;
        func(flexloader.jq, myApp, config);
    }
    name ? flexloader.ready(name, context) : flexloader.ready(context);
}

// general purpose storage for data to be used by our app when it's launched
flexloader.data = {};
flexloader.storeData = function (dataset, data) {
    flexloader.data[dataset] = flexloader.data[dataset] || [];
    flexloader.data[dataset].push(data);
}

/**
 * Widget Autoloader
 *
 * Used to autoload a widget script and optionally pass it some loading options. If you want to leverage all the
 * available properties of a full resource object (before(), ready(), etc), pass this method a resource object.
 *
 * @param component string/object   If the component parameter is a string, it will be converted to an object
 *                                  with the string assigned to the "src" property of that object. Otherwise, pass
 *                                  it a full resource object with an optional 'options' property that will be
 *                                  passed along to the widget.
 */
flexloader.autoload = function (component, options) {

    if (typeof component === 'string') {
        component = {
            src: component,
            options: options || {}
        }
    }

    if (!component || !component.src) { return; }
    component.options = component.options || {};

    (function() {
        var extenders;
        flexloader.addResource({
            before: function() {
                flexloader.autoload.loading = true;
                extenders = flexloader.extensions.length;
                if (typeof component.before === 'function') {
                    component.before();
                }
            },
            src: component.src,
            ready: function() {
                flexloader.autoload.loading = false;
                var diff = flexloader.extensions.length - extenders;
                if (diff) {
                    var a = document.createElement('a');
                    a.href = flexloader.src(component);
                    var path = '/' + a.pathname.split('/').slice(0,-1).join('/').replace(/^\/|\/$/g, '') + '/';
                    var file = a.pathname.split('/').pop();
                    var protocol = a.protocol.replace(/:$/, '');
                    for (var i=extenders;i<extenders+diff;i++) {
                        flexloader.extensions[i].config = {
                            autoload: true,
                            options: component.options,
                            script: {
                                protocol: protocol,
                                host: a.hostname,
                                path: path,
                                file: file,
                                basepath: (protocol ? protocol + ':' : '') + '//' + a.hostname + path
                            }
                        }
                    }
                    if (flexloader.loaded) {
                        flexloader.loadExtensions();
                    }
                }
                if (typeof component.ready === 'function') {
                    component.ready();
                }
            }
        });
    })();

}

flexloader.autoload.loading = false;