(function (dribbbler, undefined) {
  'use strict';

  //  Private variables
  //--------------------------------------------------------

  var api = 'https://api.dribbble.com/v1',
      token = '7fd3070a9e61d6162ef3e773ff73b54c9750cbed7fcfd5a9dd6b4267d6a3c00f';

  //  Application public methods
  //--------------------------------------------------------

  dribbbler.utilities = utilities;
  dribbbler.ajaxService = ajaxService;
  dribbbler.ajax = ajax;

  //  Functions
  //--------------------------------------------------------

  function utilities() {
    return {
      preloader: preloader,
      toJson: toJson,
      fromJson: fromJson,
      isDefined: isDefined,
      isUndefined: isUndefined,
      isString: isString
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

    function toJson(obj) {
      if (isUndefined(obj)) {
        return undefined;
      }
      return JSON.stringify(obj);
    }

    function fromJson(json) {
      return isString(json) ? JSON.parse(json) : json;
    }

    function isDefined(value) {
      return typeof value !== 'undefined';
    }

    function isUndefined(value) {
      return typeof value === 'undefined';
    }

    function isString(value) {
      return typeof value === 'string';
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
          callback(xhttp.responseText);
        }
      };
      if (method === 'POST') {
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      }
      xhttp.send(params);
    };

    ajax.get = function (url, params, callback, async) {
      params.access_token = token;
      var query = [];
      for (var key in params) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
      ajax.send(api + url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    };

    ajax.post = function (url, params, callback, async) {
      params.access_token = token;
      var query = [];
      for (var key in params) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
      ajax.send(api + url, callback, 'POST', query.join('&'), async);
    };

    return ajax;
  }

  //  XMLHttpRequest wrapped into a promise
  //--------------------------------------------------------

  function ajax(options) {
    var deferred = Q.defer(),
      req = new XMLHttpRequest();

    options.params.access_token = token;
    var query = [];
    for (var key in options.params) {
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(options.params[key]));
    }

    console.log(options);

    req.open(options.method || 'GET', options.url + (query.length ? '?' + query.join('&') : ''), true);

    // Set request headers if provided.
    Object.keys(options.headers || {}).forEach(function (key) {
      req.setRequestHeader(key, options.headers[key]);
    });

    req.onreadystatechange = function(e) {
      if(req.readyState !== 4) {
        return;
      }

      if([200,304].indexOf(req.status) === -1) {
        deferred.reject(new Error('Server responded with a status of ' + req.status));
      } else {
        //console.log(e.target);
        deferred.resolve(e.target.response);
      }
    };

    req.send(null);

    return deferred.promise;
  }

  //ajax({url: api + '/shots', params: {page: 1}}).then(successHandler, errorHandler);

  function successHandler(response) {
    console.log('success ', JSON.parse(response));
  }

  function errorHandler(response) {
    console.log(response);
  }

})(window.dribbbler = window.dribbbler || {});
