(function (dribbbler, undefined) {
  'use strict';

  // Variables
  // ========================================================
  var dribbbleShots = document.querySelector('.dribbble-shots'),
    pageIndex = 1,
    ajaxService = dribbbler.ajaxService(),
    utilities = dribbbler.utilities();

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
    getData(pageIndex);
  }

  function getData(index) {
    utilities.preloader('activate');
    console.log('get data');
    ajaxService.get('/shots', {page: index}, responseHandler);
  }

  function responseHandler(response) {
    var data = utilities.fromJson(response);
    for (var i = 0, len = data.length; i < len; i++) {
      var images = data[i].images,
        shotDiv = document.createElement('div'),
        imageWrapper = document.createElement('div'),
        imageShadow = document.createElement('div'),
        shotImage = document.createElement('img'),
        infoWrapper = document.createElement('div'),
        infoBox = document.createElement('div'),
        infoBoxContent = document.createElement('div'),
        imageTitle = document.createElement('h2'),
        userNameWrapper = document.createElement('h3'),
        userName = document.createElement('span'),
        favoriteButton = document.createElement('button');

      // Create image
      shotImage.src = images.normal;
      shotImage.title = shotImage.alt = data[i].title;

      // Create image-shadow
      imageShadow.classList.add('image-shadow');

      // Create image-wrapper
      imageWrapper.classList.add('image-wrapper');

      // Create image block
      imageShadow.appendChild(shotImage);
      imageWrapper.appendChild(imageShadow);

      // Create headings
      imageTitle.innerHTML = data[i].title;
      userName.innerHTML = data[i].user.name;
      userNameWrapper.appendChild(userName);

      // Create button with event listener
      favoriteButton.classList.add('btn-favorite');
      favoriteButton.innerHTML = 'Favorite';
      favoriteButton.title = 'Favorite';
      // Send shot id to markFavorite function as a parameter
      favoriteButton.addEventListener('click', markFavorite.bind(null, data[i].id));

      // Create info block
      infoBoxContent.classList.add('info-box-content');
      infoBoxContent.appendChild(imageTitle);
      infoBoxContent.appendChild(userNameWrapper);
      infoBoxContent.appendChild(favoriteButton);

      infoBox.classList.add('info-box');
      infoBox.appendChild(infoBoxContent);
      infoWrapper.className += 'info-wrapper animate-all';
      infoWrapper.id = data[i].id;
      // Check to see if shot is liked/favorited and add class for hear image
      if (isLiked(data[i].id)) {
        infoWrapper.classList.add('liked');
      }
      infoWrapper.appendChild(infoBox);

      // Add all together

      shotDiv.className += 'col-lg-4 col-md-6 col-sm-6 col-xs-12 shot';
      shotDiv.appendChild(imageWrapper);
      shotDiv.appendChild(infoWrapper);

      dribbbleShots.appendChild(shotDiv);
    }
    utilities.preloader('deactivate');
  }

  function checkForNewDiv() {
    var lastDiv = document.querySelector('.dribbble-shots > div:last-child'),
      lastDivOffset = lastDiv.offsetTop + lastDiv.clientHeight,
      pageOffset = window.pageYOffset + window.innerHeight;

    if (pageOffset >= lastDivOffset) {
      console.log('inside checkForNewDiv');
      pageIndex += 1;
      getData(pageIndex);
    }
  }

  function markFavorite(id) {
    var favoriteShots = utilities.fromJson(localStorage.getItem('favoriteShots')),
      shotIndex;
    if (favoriteShots) {
      if (!isLiked(id)) {
        favoriteShots.push(id);
        addLike(id);
      } else {
        shotIndex = favoriteShots.indexOf(id);
        favoriteShots.splice(shotIndex, 1);
        removeLike(id);
      }
    } else {
      favoriteShots = [];
      favoriteShots.push(id);
      addLike(id);
    }

    localStorage.setItem('favoriteShots', utilities.toJson(favoriteShots));
  }

  function isLiked(id) {
    var favoriteShots = utilities.fromJson(localStorage.getItem('favoriteShots'));
    if (favoriteShots) {
      return favoriteShots.indexOf(id) > -1;
    }
    return false;
  }

  function addLike(id) {
    var clickedShot = document.getElementById(id);
    clickedShot.classList.add('liked');
  }

  function removeLike(id) {
    var clickedShot = document.getElementById(id);
    clickedShot.classList.remove('liked');
  }

})(window.dribbbler);
