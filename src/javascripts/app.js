(function (dribbbler) {
  'use strict';

  //  Private variables
  //--------------------------------------------------------

  var api = 'https://api.dribbble.com/v1',
      token = '7fd3070a9e61d6162ef3e773ff73b54c9750cbed7fcfd5a9dd6b4267d6a3c00f',
      preloader = document.getElementById('preloader'),
      template = document.getElementById('template').innerHTML;

  //  Application public methods
  //--------------------------------------------------------

  dribbbler.utilities = utilities;
  dribbbler.ajaxService = ajaxService;
  dribbbler.createElements = createElements;

  //  Functions
  //--------------------------------------------------------

  function utilities() {
    return {
      loading: loading,
      toJson: toJson,
      fromJson: fromJson,
      isDefined: isDefined,
      isUndefined: isUndefined,
      isString: isString,
      isLiked: isLiked
    };

    function loading(state) {
      var states = {
        'on': function () {
          //console.log('on');
          preloader.classList.add('loading');
        },
        'off': function () {
          //console.log('off');
          preloader.classList.remove('loading');
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

    function isLiked(id) {
      var favoriteShots = fromJson(localStorage.getItem('favoriteShots'));
      if (favoriteShots) {
        return favoriteShots.indexOf(id) > -1;
      }
      return false;
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

  function createElements(parent, data) {
    var shot;

    for (var i = 0, len = data.length; i < len; i++) {
      shot = {
        id: data[i].id,
        image: data[i].images.normal,
        title: data[i].title,
        author: data[i].user.name,
        liked: utilities().isLiked(data[i].id) ? ' liked' : ''
      };

      parent.innerHTML = parent.innerHTML + TemplateEngine(template, shot);
    }
  }

  function TemplateEngine(html, options) {
    var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
    var add = function (line, js) {
      js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
        (code += line !== '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
      return add;
    };
    while (match = re.exec(html)) {
      add(html.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
  }

})(window.dribbbler = window.dribbbler || {});
