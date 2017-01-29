var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable', 'angular-plaid-link', 'angular-stripe', 'gavruk.card', 'gavruk.check', 'ngFileUpload', 'ngSignaturePad', 'angularjs-dropdown-multiselect', 'myApp.core.services', 'myApp.core.directives', 'myApp.videochat', 'chart.js', 'duScroll', 'rx', 'angular-points-path', 'datetime'])
.value('duScrollDuration', 2000)
.value('duScrollOffset', 30);
myApp.config(['$mdThemingProvider', function($mdThemingProvider){

  $mdThemingProvider.theme('black')
  .primaryPalette('grey', {
      'default': '900', // by default use shade 900 from the grey palette for primary intentions
  });
  $mdThemingProvider.setDefaultTheme('black');
}]);

myApp.config(function($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function(date) {
    console.log('inside moment(date).format("YYYY/MM/DD")');
    console.log('inside moment().format("YYYY/MM/DD")', moment(date).format('YYYY/MM/DD'));
    return moment(date).format('YYYY/MM/DD');
  };
});

myApp.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    //    key: 'your api key',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
});



// START SOCKET IO
myApp.factory('Socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      console.log('inside inside Socket Factory on, socket::', socket);
      console.log('inside inside Socket Factory on, eventName::', eventName);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      console.log('inside inside Socket Factory emit, socket::', socket);
      console.log('inside inside Socket Factory emit, eventName::', eventName);

      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    },

    off: function (eventName) {
      console.log('inside inside Socket Factory before off, socket._callbacks::', socket._callbacks);
      console.log('inside inside Socket Factory off, eventName::', eventName);
      console.log('inside inside Socket Factory off, socket.off::', socket.off);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.off(eventName);
      console.log('inside inside Socket Factory after socket.off, socket._callbacks::', socket._callbacks);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    removeListener: function (eventName, callback) {
      console.log('inside inside Socket Factory before removeListener, socket._callbacks::', socket._callbacks);
      console.log('inside inside Socket Factory removeListener, eventName::', eventName);
      console.log('inside inside Socket Factory removeListener, socket.removeListener::', socket.removeListener);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.removeListener(eventName, wrapper);
      console.log('inside inside Socket Factory after removeListener, socket._callbacks::', socket._callbacks);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    removeAllListeners: function (eventName) {
      console.log('inside inside Socket Factory removeAllListeners, socket::', socket);
      console.log('inside inside Socket Factory removeAllListeners, eventName::', eventName);

      socket.removeAllListeners(eventName);

      return function () {
        socket.removeAllListeners(eventName);
      };
    },

    yellowFoot: function (eventName) {
      console.log('inside inside Socket Factory yellowFoot, socket::', socket);
      console.log('inside inside Socket Factory yellowFoot, eventName::', eventName);

      socket.removeAllListeners(eventName);

      return function () {
        socket.removeAllListeners(eventName);
      };
    },

    addListener: function (eventName, callback) {
      console.log('inside inside Socket Factory addListener, socket::', socket);
      console.log('inside inside Socket Factory addListener, eventName::', eventName);

      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.on(eventName, wrapper);
      };
    },

  };
}]);

// END SOCKET IO

myApp.config(["$routeProvider", function($routeProvider){
  $routeProvider.

  when("/login", {
    // requireAuth: true,
    url: "/assets/views/users.html#/login", //assets/views/users.html#/home
    controller: "HomeController"
  }).
  when("/sign-up", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/login/login.html",
    controller: "HomeController"
  }).
  when("/home", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/home/dashboard.html",
    controller: "HomeController"
  }).
  otherwise({
    redirectTo: '/home'
  });
}]);

// angular-stripe stuff
myApp.config(function (stripeProvider) {
  stripeProvider.setPublishableKey('pk_test_C6pNjUH41hCQ87RXmeLBIAa5');
});

myApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
  //   editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default', 'md'

});

myApp.controller('main', function($scope, $timeout, $http){
  // Create the array to hold the list of Birthdays
  $scope.bdays = [];

  // Create the function to push the data into the "bdays" array
  $scope.newBirthday = function(){
    $scope.bdays.push({name:'', date: '', isNew: true});
    var updateBDaylist = $scope.bdays;
    console.log('updateBDaylist', updateBDaylist);

    $http.post("/bdays", updateBDaylist).then(function(response){
      console.log("back from /bdays! ", response.data);

    });
  };
  $scope.savebdays = function(bdays){
  };
});



// On esc event
myApp.directive('onEsc', function() {
  return function(scope, elm, attr) {
    elm.bind('keydown', function(e) {
      if (e.keyCode === 27) {
        scope.$apply(attr.onEsc);
      }
    });
  };
});

// On enter event
myApp.directive('onEnter', function() {
  return function(scope, elm, attr) {
    elm.bind('keypress', function(e) {
      if (e.keyCode === 13) {
        scope.$apply(attr.onEnter);
      }
    });
  };
});

// Inline edit directive
myApp.directive('inlineEditTwo', function($timeout,$mdDialog) {
  return {
    scope: {
      model: '=inlineEditTwo',
      handleSave: '&onSave',
      handleCancel: '&onCancel'
    },
    link: function(scope, elm, attr) {
      var previousValue;

      scope.edit = function() {
        scope.editMode = true;
        previousValue = scope.model;

        $timeout(function() {
          elm.find('input')[0].focus();
        }, 0, false);
      };
      scope.save = function() {
        scope.editMode = false;
        scope.handleSave({value: scope.model});
      };
      scope.cancel = function() {
        scope.editMode = false;
        scope.model = previousValue;
        scope.handleCancel({value: scope.model});
      };
    },
    templateUrl: 'routes/inline-edit.html'
  };
});
