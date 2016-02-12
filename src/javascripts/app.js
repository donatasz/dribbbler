(function (dribbbler, undefined) {
    'use strict';

    //  Private variables
    //--------------------------------------------------------

    var api = 'https://api.dribbble.com/v1',
        token = '7fd3070a9e61d6162ef3e773ff73b54c9750cbed7fcfd5a9dd6b4267d6a3c00f';

    //  Public methods
    //--------------------------------------------------------

    dribbbler.utilities = utilities;
    dribbbler.ajaxService = ajaxService;

    //  Functions
    //--------------------------------------------------------

    function utilities() {
        return {
            preloader: preloader
        };

        function preloader(state) {
            var preloader = document.getElementById('preloader');

            var states = {
                activate: function () {
                    console.log('on');
                    preloader.classList.add('preloader');
                },
                deactivate: function () {
                    console.log('off');
                    preloader.classList.remove('preloader');
                }
            };
            states[state]();
        }
    }

    function ajaxService() {
        var ajax = {};

        ajax.xhttp = function () {
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
            var xhttp = ajax.xhttp();
            xhttp.open(method, url, async);
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    callback(xhttp.responseText)
                }
            };
            if (method === 'POST') {
                xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
            xhttp.send(params)
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

})(window.dribbbler = window.dribbbler || {});
