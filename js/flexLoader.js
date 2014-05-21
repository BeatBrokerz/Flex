/**
 * Modified version of head.js v1.0.3
 * Loaded into the "flexloader" namespace.
 */
(function(e,t){"use strict";function n(){}function r(e,t){if(!e){return}if(typeof e==="object"){e=[].slice.call(e)}for(var n=0,r=e.length;n<r;n++){t.call(e,e[n],n)}}function i(e,n){var r=Object.prototype.toString.call(n).slice(8,-1);return n!==t&&n!==null&&r===e}function s(e){return i("Function",e)}function o(e){return i("Array",e)}function u(e){var t=e.split("/"),n=t[t.length-1],r=n.indexOf("?");return r!==-1?n.substring(0,r):n}function a(e){e=e||n;if(e._done){return}e();e._done=1}function f(e,t,r,i){var s=typeof e==="object"?e:{test:e,success:!!t?o(t)?t:[t]:false,failure:!!r?o(r)?r:[r]:false,callback:i||n};var u=!!s.test;if(u&&!!s.success){s.success.push(s.callback);P.load.apply(null,s.success)}else if(!u&&!!s.failure){s.failure.push(s.callback);P.load.apply(null,s.failure)}else{i()}return P}function l(e){var t={};if(typeof e==="object"){for(var n in e){if(!!e[n]){t={name:n,url:e[n]}}}}else{t={name:u(e),url:e}}var r=A[t.name];if(r&&r.url===t.url){return r}A[t.name]=t;return t}function c(e){e=e||A;for(var t in e){if(e.hasOwnProperty(t)&&e[t].state!==F){return false}}return true}function h(e){e.state=B;r(e.onpreload,function(e){e.call()})}function p(e,n){if(e.state===t){e.state=H;e.onpreload=[];y({url:e.url,type:"cache"},function(){h(e)})}}function d(){var e=arguments,t=e[e.length-1],n=[].slice.call(e,1),i=n[0];if(!s(t)){t=null}if(o(e[0])){e[0].push(t);P.load.apply(null,e[0]);return P}var u=l(e[0]);if(_==L.length){r(k[u.name],function(e){a(e)})}u.sequence=L.length;L.push(u.name);if(!!i){var f={};r(n,function(e){if(!s(e)&&!!e){e=l(e);p(e);f[e.name]=e}});m(u,s(i)?i:function(){r(n,function(e){if(!s(e)&&!!e){e=l(e);if(_==L.length){r(k[e.name],function(e){a(e)})}e.sequence=L.length;L.push(e.name);m(e,function(){if(t&&c(f)){a(t)}})}})})}else{m(u)}return P}function v(){var e=arguments,t=e[e.length-1],n={};if(!s(t)){t=null}if(o(e[0])){e[0].push(t);P.load.apply(null,e[0]);return P}r(e,function(e,r){if(e!==t){e=l(e);n[e.name]=e}});r(e,function(e,i){if(e!==t){e=l(e);if(_==L.length){r(k[e.name],function(e){a(e)})}e.sequence=L.length;L.push(e.name);m(e,function(){if(c(n)){a(t)}})}});return P}function m(e,t){t=t||n;if(e.state===F){t();return}if(e.state===j){P.ready(e.name,t);return}if(e.state===H){e.onpreload.push(function(){m(e,t)});return}e.state=j;y(e,function(){e.state=F;t();r(C[e.name],function(e){a(e)});_=e.sequence+1;var n=L[_];if(n){r(k[n],function(e){a(e)})}if(M&&c()){r(C.ALL,function(e){a(e)})}})}function g(e){e=e||"";var t=e.split("?")[0].split(".");return t[t.length-1].toLowerCase()}function y(t,r){function i(t){t=t||e.event;u.onload=u.onreadystatechange=u.onerror=null;r()}function s(n){n=n||e.event;if(n.type==="load"||/loaded|complete/.test(u.readyState)&&(!T.documentMode||T.documentMode<9)){e.clearTimeout(t.errorTimeout);e.clearTimeout(t.cssTimeout);u.onload=u.onreadystatechange=u.onerror=null;r()}}function o(){if(t.state!==F&&t.cssRetries<=20){for(var n=0,r=T.styleSheets.length;n<r;n++){if(T.styleSheets[n].href===u.href){s({type:"load"});return}}t.cssRetries++;t.cssTimeout=e.setTimeout(o,250)}}r=r||n;var u;var a=g(t.url);if(a==="css"){u=T.createElement("link");u.type="text/"+(t.type||"css");u.rel="stylesheet";u.href=t.url;t.cssRetries=0;t.cssTimeout=e.setTimeout(o,500)}else{u=T.createElement("script");u.type="text/"+(t.type||"javascript");u.src=t.url}u.onload=u.onreadystatechange=s;u.onerror=i;u.async=false;u.defer=false;t.errorTimeout=e.setTimeout(function(){i({type:"timeout"})},7e3);var f=T.head||T.getElementsByTagName("head")[0];f.insertBefore(u,f.lastChild)}function b(){var e=T.getElementsByTagName("script");for(var t=0,n=e.length;t<n;t++){var r=e[t].getAttribute("data-headjs-load");if(!!r){P.load(r);return}}}function w(e,t){if(e===T){if(M){a(t)}else{N.push(t)}return P}if(s(e)){t=e;e="ALL"}if(o(e)){var n={};r(e,function(e){n[e]=A[e];P.ready(e,function(){if(c(n)){a(t)}})});return P}if(typeof e!=="string"||!s(t)){return P}var i=A[e];if(i&&i.state===F||e==="ALL"&&c()&&M){a(t);return P}var u=C[e];if(!u){u=C[e]=[t]}else{u.push(t)}return P}function E(e,t){if(typeof e!=="string"||!s(t)){return P}var n=A[e];if(n&&n.state===F){return P}var r=k[e];if(!r){r=k[e]=[t]}else{r.push(t)}return P}function S(){if(!T.body){e.clearTimeout(P.readyTimeout);P.readyTimeout=e.setTimeout(S,50);return}if(!M){M=true;b();r(N,function(e){a(e)})}}function x(){if(T.addEventListener){T.removeEventListener("DOMContentLoaded",x,false);S()}else if(T.readyState==="complete"){T.detachEvent("onreadystatechange",x);S()}}var T=e.document,N=[],C={},k={},L=[],A={},O="async"in T.createElement("script")||"MozAppearance"in T.documentElement.style||e.opera,M,_=0,D="flexloader",P=e[D]=e[D]||function(){P.ready.apply(null,arguments)},H=1,B=2,j=3,F=4;if(T.readyState==="complete"){S()}else if(T.addEventListener){T.addEventListener("DOMContentLoaded",x,false);e.addEventListener("load",S,false)}else{T.attachEvent("onreadystatechange",x);e.attachEvent("onload",S);var I=false;try{I=!e.frameElement&&T.documentElement}catch(q){}if(I&&I.doScroll){(function R(){if(!M){try{I.doScroll("left")}catch(t){e.clearTimeout(P.readyTimeout);P.readyTimeout=e.setTimeout(R,50);return}S()}})()}}P.load=P.js=O?v:d;P.test=f;P.ready=w;P.before=E;P.ready(T,function(){if(c()){r(C.ALL,function(e){a(e)})}if(P.feature){P.feature("domloaded",true)}})})(window)

/**
 * @var coreVer
 * @type string A property that we can override to ensure the latest release of resources are loaded
 */
flexloader.coreVer = '1.00';

/**
 * Priority Init: Reserve a place for a priorityInit() method that we can define later, which will still
 * be fired before any other "ready" handlers which are attached to our loader.
 */
flexloader.ready(function () {
    if (flexloader.priorityInit) {
        flexloader.priorityInit();
    }
});

/**
 * After loading jQuery, save a reference to it for internal use.
 */
flexloader.ready('jquery', function () {
    flexloader.jq = jQuery;
});

/**
 * After loading knockout, save a reference to it for internal use.
 */
flexloader.ready('knockout', function () {
    flexloader.jq.ko = ko;
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
                if (typeof jQuery === 'undefined' || parseInt(jQuery.fn.jquery) != 2) {
                    flexloader.jqConflict = typeof jQuery !== 'undefined' ? true : false;
                    return true;
                }
                else {
                    flexloader.jqConflict = false;
                }
            },
            src: "//www.beatbrokerz.com/flex/js/jquery.min.js",
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
                return true;
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
        }
        flexloader.ready(function () {
            flexloader.loaded = true;
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
    if (resource.core) {
        return resource.src.indexOf('?') >= 0 ? resource.src + '&core=' + flexloader.coreVer : resource.src + '?core=' + flexloader.coreVer;
    }
    return resource.src;
}

/**
 * Conveniently put together resources from a components list
 * @param components
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

// used to add a javascript resource to load with other app resources
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


// shortcut to add multiple javascript resources at once
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

// storage for data to be used by our app when it's launched
flexloader.data = {};
flexloader.storeData = function (dataset, data) {
    flexloader.data[dataset] = flexloader.data[dataset] || [];
    flexloader.data[dataset].push(data);
}

/**
 * Widget autoloader convenience method
 * @param component string/object
 *
 * If the component parameter is a string, it will be converted to an object
 * with the passed string assigned to the "src" property of that object.
 *
 * If the component parameter is an object, the src property should contain the
 * url of the widget to load, and an optional "options" parameter will be passed
 * as the "config" parameter to any functions that the widget registers with the
 * extendApp() method.
 */
flexloader.autoload = function (component) {

    if (typeof component === 'string') {
        component = {
            src: component
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
            },
            src: component.src,
            ready: function() {
                flexloader.autoload.loading = false;
                var diff = flexloader.extensions.length - extenders;
                if (diff) {
                    var a = document.createElement('a');
                    a.href = component.src;
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
                    flexloader.loadExtensions();
                }
            }
        });
    })();

}

flexloader.autoload.loading = false;