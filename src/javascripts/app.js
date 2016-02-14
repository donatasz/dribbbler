(function (dribbbler, undefined) {
  'use strict';

  //  Private variables
  //--------------------------------------------------------

  var api = 'https://api.dribbble.com/v1',
    token = '7fd3070a9e61d6162ef3e773ff73b54c9750cbed7fcfd5a9dd6b4267d6a3c00f',
    view = null,
    // A hash to store templates
    templateCache = {},
    // A hash to store routes
    routes = {
      '/': {templateId: 'home', controller: HomeController},
      '/page1': {templateId: 'template1', controller: Page1Controller},
      '/page2': {templateId: 'template2', controller: Page2Controller}
    };

  //  Event listeners for Router
  //--------------------------------------------------------

  // Listen on hash change:
  window.addEventListener('hashchange', router);
  // Listen on page load:
  window.addEventListener('load', router);

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

  function createTemplate(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      templateCache[str] = templateCache[str] ||
        createTemplate(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

          // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

          // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("{{").join("\t")
          .replace(/((^|\}\})[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)\}\}/g, "',$1,'")
          .split("\t").join("');")
          .split("}}").join("p.push('")
          .split("\r").join("\\'")
        + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  }

  function router() {
    // Lazy load view element:
    view = view || document.getElementById('view');
    // Current route url (getting rid of '#' in hash as well):
    var url = location.hash.slice(1) || '/';
    // Get route by url:
    var route = routes[url];
    // Do we have both a view and a route?
    if (view && route.controller) {
      // Render route template with John Resig's template engine:
      view.innerHTML = createTemplate(route.templateId, new route.controller());
    }
  }

  //  Application controllers
  //--------------------------------------------------------

  function HomeController() {
    var vm = this;
    vm.category = 'Random Shots';
    vm.shots = [{id:1, title: 'Lorem ipsum', user: {name: 'Dolorem'}, images: {normal: 'https://d13yacurqjgara.cloudfront.net/users/39185/screenshots/2523093/flower.jpg'}}];

    //ajax({url: api + '/shots', params: {page: 1}}).then(successHandler, errorHandler);

    function successHandler(response) {
      console.log(vm);
      vm.shots = JSON.parse(response);
      console.log('success ', JSON.parse(response));
    }

    function errorHandler(response) {
      console.log(response);
    }
  }

  function Page1Controller() {
    this.category = 'Debuts';
  }

  function Page2Controller() {
    this.category = 'Teams';
  }

  function responseHandler(response) {
    var dataObject = {
        shots: utilities().fromJson(response)
      };

    console.log(dataObject);
    view.innerHTML = createTemplate('home', dataObject);
  }

})(window.dribbbler = window.dribbbler || {});
