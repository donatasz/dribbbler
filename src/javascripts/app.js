(function () {
    'use strict';

    //  Variables
    //--------------------------------------------------------

    var api = 'https://api.dribbble.com/v1',
        token = '7fd3070a9e61d6162ef3e773ff73b54c9750cbed7fcfd5a9dd6b4267d6a3c00f';

    var app = {
        helpers: helpersService,
        ajax: ajaxService
    };

    //  Functions
    //--------------------------------------------------------

    function helpersService() {
        return {
            preloader: preloader
        };

        function preloader(state) {
            var preloader = document.getElementById('preloader');

            var states = {
                activate: function() {
                    preloader.classList.add('preloader');
                },
                deactivate: function() {
                    preloader.classList.remove('preloader');
                }
            };
            states[state]();
        }
    }

    function ajaxService() {
        this.helpers().preloader('activate');

        var ajax = {};

        ajax.x = function () {
            if (typeof XMLHttpRequest !== 'undefined') {
                return new XMLHttpRequest();
            }
            var versions = [
                "MSXML2.XmlHttp.6.0",
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp"
            ];

            var xhr;
            for (var i = 0; i < versions.length; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                } catch (e) {
                    console.log('Error: ', e);
                }
            }
            return xhr;
        };

        ajax.send = function (url, callback, method, params, async) {
            if (async === undefined) {
                async = true;
            }
            var x = ajax.x();
            x.open(method, url, async);
            x.onreadystatechange = function () {
                if (x.readyState === 4) {
                    callback(x.responseText)
                }
            };
            if (method === 'POST') {
                x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
            x.send(params)
        };

        ajax.get = function (url, params, callback, async) {
            params.access_token = token;
            var query = [];
            for (var key in params) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
            ajax.send(api + url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
        };

        ajax.post = function (url, params, callback, async) {
            params.access_token = token;
            var query = [];
            for (var key in params) {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
            ajax.send(api + url, callback, 'POST', query.join('&'), async)
        };

        return ajax;
    }

    window.app = app;

}());
