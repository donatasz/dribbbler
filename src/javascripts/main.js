(function (dribbbler) {
  'use strict';

  // Variables
  // ========================================================
  var dribbbleShots = document.querySelector('.dribbble-shots'),
      pageIndex = 1,
      ajaxService = dribbbler.ajaxService(),
      utilities = dribbbler.utilities(),
      createElements = dribbbler.createElements;

  // Listen for DOMContentLoaded and initialize
  // ========================================================

  document.addEventListener('DOMContentLoaded', function () {
    init();
  });

  // Functions
  // ========================================================

  function init() {
    document.addEventListener('scroll', function () {
      checkForNewDiv();
    });
    dribbbleShots.addEventListener('click', markFavorite);
    getData(pageIndex);
  }

  function getData(index) {
    utilities.loading('on');
    ajaxService.get('/shots', {page: index}, responseHandler);
  }

  function responseHandler(response) {
    var data = utilities.fromJson(response);
    createElements(dribbbleShots, data);
    utilities.loading('off');
  }

  function checkForNewDiv() {
    var lastDiv = document.querySelector('.dribbble-shots > article:last-child'),
      lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight,
      pageOffset = window.pageYOffset + window.innerHeight;

    if (pageOffset >= lastDivOffset) {
      pageIndex += 1;
      getData(pageIndex);
    }
  }

  function markFavorite(event) {
    var target = event.target || event.srcElement,
        targetId = Number(target.id),
        favoriteShots = utilities.fromJson(localStorage.getItem('favoriteShots')),
        shotIndex;

    if (target.nodeName === 'BUTTON') {
      if (favoriteShots) {
        if (!utilities.isLiked(targetId)) {
          favoriteShots.push(targetId);
          addLike(targetId);
        } else {
          shotIndex = favoriteShots.indexOf(targetId);
          favoriteShots.splice(shotIndex, 1);
          removeLike(targetId);
        }
      } else {
        favoriteShots = [];
        favoriteShots.push(targetId);
        addLike(targetId);
      }

      localStorage.setItem('favoriteShots', utilities.toJson(favoriteShots));
    }
  }

  function addLike(id) {
    var clickedShot = document.querySelector("[data-id='" + id + "']");
    clickedShot.classList.add('liked');
  }

  function removeLike(id) {
    var clickedShot = document.querySelector("[data-id='" + id + "']");
    clickedShot.classList.remove('liked');
  }

})(window.dribbbler);
