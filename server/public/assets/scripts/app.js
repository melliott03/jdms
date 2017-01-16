var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable', 'angular-plaid-link', 'angular-stripe', 'gavruk.card', 'gavruk.check', 'ngFileUpload', 'ngSignaturePad', 'angularjs-dropdown-multiselect', 'myApp.core.services', 'myApp.core.directives', 'myApp.videochat', 'chart.js', 'duScroll', 'rx', 'angular-points-path', 'datetime'])
.value('duScrollDuration', 2000)
.value('duScrollOffset', 30);
/*'bc.TelephoneFilter' is replaced by 'ngIntlTelInput'*/
//ngPlacesAutocomplete ngAutocomplete
myApp.config(['$mdThemingProvider', function($mdThemingProvider){
  $mdThemingProvider.theme('default')
  // .dark();
  .primaryPalette('blue-grey')
  .accentPalette('grey');

  // $mdThemingProvider.theme('altTheme')
  //      .primaryPalette('purple')
  //      .accentPalette('green');
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

// myApp.run(function(editableOptions) {
//   editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
// });

myApp.filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  }
});

// START SOCKET IO
myApp.factory('Socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  console.log("socket created, socket::", socket);
  console.log("socket created, typeof socket::", typeof socket.on);
  console.log("socket created, typeof socket.emit::", typeof socket.emit);
  console.log("socket created, typeof socket.removeListener::", typeof socket.removeListener);
  console.log("socket created, typeof socket.off::", typeof socket.off);
  console.log("socket created, typeof socket.removeEventListener::", typeof socket.removeEventListener);
  console.log("socket created, typeof socket.addListener::", typeof socket.addListener);
  console.log("socket created, typeof socket.removeAllListeners::", typeof socket.removeAllListeners);

  console.log("socket created, socket.removeListener::", socket.removeListener);
  console.log("socket created, socket.off::", socket.off);
  console.log("socket created, socket.removeEventListener::", socket.removeEventListener);
  console.log("socket created, socket.addListener::", socket.addListener);
  console.log("socket created, socket.removeAllListeners::", socket.removeAllListeners);

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


//STARRT ANGULAR TWILIO TaskRouter STUFF
// angular.module('angularTwilioTaskRouter', [])
// myApp.controller('TwilioTaskRouterController', ['$scope', function($scope) {
// }])
// .directive('twilioTaskRouter', function() {
//   return {
//     templateUrl: 'taskrouter.html'
//   };
// });
//END ANGULAR TWILIO TaskRouter STUFF

// START route protection stuff
/*
myApp
.run(['$rootScope', '$location', '$window', 'WorkService', 'Auth', function ($rootScope, $location, $window, WorkService, Auth) {
var workService = WorkService;
$rootScope.$on('$routeChangeStart', function (event) {
console.log('window.location.href::', window.location.href);
console.log('$location.path::', $location.path);
console.log('$location.path()::', $location.path());
console.log('$location.path().length::', $location.path().length);
console.log('$location.url()::', $location.url());
console.log('$location.url()::', $location.url());
console.log('Auth.isLoggedIn()::', Auth.isLoggedIn());
// debugger;

console.log('$location.absUrl()::',$location.absUrl());
console.log('does absUrl().includes(/assets/views/users.html?::',$location.absUrl().includes('/assets/views/users.html'));
// if (!workService.isLoggedIn() && $location.path() != "/home" && $location.path().length != 0) { //&& $location.path().length > 1
if (Auth.isLoggedIn() === false) { //&& $location.path().length > 1
console.log('inside if before redirect 1::');
console.log('DENY');
event.preventDefault();
// $location.path('/');
if ($location.absUrl().includes('/assets/views/users.html') ) {
console.log('inside if before redirect 2::');
// window.location.href = "/";
}else {

}
// window.location.href = "/";
}else {
console.log('ALLOW');
// $location.path('/home');
}
});
}])
.factory('Auth', function(){
var user;
var aUser;
var getUser = function(){
$http.get("/user/name").then(function(response){
console.log(response.data);
userObject.response = response.data;
console.log('userObject in factory', userObject);
if (userObject.response == "Unauthorized") {
userObject.isLogin = false;
// setUser(false)
aUser = false;
} else {
userObject.isLogin = true;
// setUser(true);
aUser = true;
}
console.log('userObject in factory 2', userObject);
});
};

return{
setUser : function(){
console.log('setting user to aUser::', aUser);
user = aUser;
// debugger;
},
isLoggedIn : function(){
console.log('inside isLoggedIn function, user::', user);
return(user)? user : false;
// debugger;
}
};
});
*/

// .controller('loginCtrl', [ '$scope', 'WorkService', function ($scope, WorkService) {
//   var Auth = WorkService;
//   //submit
//   $scope.login = function () {
//     // Ask to the server, do your job and THEN set the user
//
//     Auth.setUser(user); //Update the state of the user in the app
//   };
// }])
// myApp.controller('mainCtrl', ['$scope', 'WorkService', '$location', function ($scope, WorkService, $location) {
//   var Auth = WorkService;
//
//   $scope.$watch(Auth.isLoggedIn, function (value, oldValue) {
//     console.log('in mainCtrl $scope.$watch(Auth.isLoggedIn value::', value);
//     console.log('in mainCtrl $scope.$watch(Auth.isLoggedIn oldValue::', oldValue);
//
//     if(!value && oldValue) {
//       console.log("Disconnect");
//       $location.path('/');
//     }
//
//     if(value) {
//       console.log("Connect");
//       //Do something when the user is connected
//     }
//
//   }, true);
//
// }]);

// END route protection stuff

myApp.config(["$routeProvider", function($routeProvider){
  $routeProvider.
  when('/', {
    templateUrl : '/',
    controller : 'mainController'
  }).
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
  when("/home/charges", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/home/charges.html",
    controller: "ShowController"
  }).
  when("/home/dashboard", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/home/dashboard.html",
    controller: "ShowController"
  }).
  when("/availibleView", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/availibleView.html",
    controller: "ShowController"
  }).
  when("/acceptedView", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/accepted.html",
    controller: "ShowController"
  }).
  when("/onsite", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/onsite/appointments.html",
    controller: "ShowController"
  }).
  when("/onsite/dashboard", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/onsite/dashboard.html",
    controller: "ShowController"
  }).
  when("/onsite/appointments", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/onsite/appointments.html",
    controller: "ShowController"
  }).
  when("/onsite/appointments2", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/onsite/appointments2.html",
    controller: "pipeCtrl"
  }).
  when("/workdetail", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/workdetail.html",
    controller: "ShowController"
  }).
  when("/terms", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/terms.html",
    controller: "ShowController"
  }).
  when("/accountCont", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/account-contractor.html",
    controller: "ShowController"
  }).
  when("/accountCust", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/account-customer.html",
    controller: "ShowController"
  }).
  when("/sign", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/sign.html",
    controller: "ShowController"
  }).
  when("/phone", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/phone/calls.html",
    controller: "ShowController"
  }).
  when("/phone/dashboard", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/phone/dashboard.html",
    controller: "ShowController"
  }).
  when("/phone/calls", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/phone/calls.html",
    controller: "ShowController"
  }).
  when("/addwork", {
    // requireAuth: true,
    templateUrl: "/assets/views/addDialog.tmpl.html",
    controller: "ShowController"
  }).
  when("/admin_addwork", {
    // requireAuth: true,
    templateUrl: "/assets/views/adminAddDialog.tmpl.html",
    controller: "ShowController"
  }).
  when("/videoCust", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/getvideointerpreter.html",
    controller: "ShowController"
  }).
  when("/translateCust", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/translate/documentTranslate.html",
    controller: "ShowController"
  }).
  when("/userRegisterSuccess", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/translate/documentTranslate.html",
    controller: "ShowController"
  }).
  when("/worker", {
    // requireAuth: true,
    templateUrl: "/assets/views/routes/worker/dashboard.html",
    controller: "ShowController"
  }).
  otherwise({
    redirectTo: '/home'
  });
}]);

// myApp.controller('AuthCnt', ['$scope','$location','$window','WorkService', function($scope, $location, $window, WorkService) {
//         var workService = WorkService;
//         $scope.$on('$routeChangeStart', function(angularEvent, newUrl) {
//           console.log('route changed state::');
//           console.log('workService.userObject.isLogin::', workService.userObject.isLogin);
//
//           var user = {};
//           // user.isAuthenticated = false;
//             if (newUrl.requireAuth && workService.userObject.isLogin === false) {
//               console.log('user is not authenticated, redirecting to homepage::');
//                 // User isn’t authenticated
//                 // $location.path("login");
//                 window.location.href = "/";
//                 // $location.absUrl("nowlanguage.com");
//             }
//         });
//     }]);
/*
// end Protecting routes
myApp.config(function ($stateProvider) {

$stateProvider
.state('home', {
url: '/home',
// ...
data: {
requireLogin: false
}
})
.state('/', {
url: '/assets',
abstract: true,
// ...
data: {
requireLogin: true // this property will apply to all children of 'app'
}
})
.state('app.dashboard', {
// child state of `app`
// requireLogin === true
})

});

myApp.run(function ($rootScope) {

$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
var requireLogin = toState.data.requireLogin;

if (requireLogin && typeof $rootScope.userObject.isAuthenticated === false || $rootScope.userObject.isAuthenticated === 'undefined') {
event.preventDefault();
// get me a login modal!
}
});

});
// end Protecting routes
*/
// //START PLAID RE STUFF
// myApp.config([
//      'plaidLinkProvider',
//
//      function(plaidLinkProvider) {
//          plaidLinkProvider.init({
//            selectAccount: true,
//              clientName: 'My App',
//              env: 'tartan',
//              key: 'test_key',
//              product: 'auth'
//          });
//      }
//  ])
//
//  .controller('mainPlaidCtrl', [
//      '$scope',
//      'plaidLink',
//
//      function($scope, plaidLink) {
//          $scope.token = '';
//          $scope.plaidIsLoaded = plaidLink.isLoaded;
//
//          plaidLink.create({
//              onSuccess: function(token, metadata) {
//                  $scope.token = token;
//                  console.log('metadata', metadata);
//              },
//              onExit: function() {
//                  console.log('user closed');
//              }
//          });
//
//          $scope.openPlaid = function() {
//              plaidLink.open();
//          };
//      }
//  ]);
// //END PLAID RE STUFF

// PLAID stuff
// myApp.config([
//         'plaidLinkProvider',
//
//         function(plaidLinkProvider) {
//             plaidLinkProvider.init({
//                 clientName: 'NowLanguage',
//                 env: 'tartan',
//                 key: '09b483e7f2a23fc9ebc47dd904323f', //test_key or 09b483e7f2a23fc9ebc47dd904323f
//                 product: 'auth',
//                 onLoad: function() {
//                   console.log('modal loaded');
//                   // The Link module finished loading.
//                 }
//             });
//         }
//     ]).controller('plaidCtrl', [
//         '$scope',
//         'plaidLink',
//         // ,
//         // '$http',
//         // 'PlaidService',
//
//         function($scope, plaidLink) { //, $http, PlaidService
//           $scope.token = '';
//            $scope.plaidIsLoaded = plaidLink.isLoaded;
//
//            plaidLink.create({
//                onSuccess: function(token) {
//                    $scope.token = token;
//                },
//                onExit: function() {
//                    console.log('user closed');
//                }
//            });
//
//            $scope.openPlaid = function(bankType) {
//                plaidLink.open(bankType);
//            };
//             // // var plaidService = PlaidService;
//             // // $scope.plaidObject = {};
//             // // $scope.sendDataToBackend = function(plaidSuccessObject){
//             // //   console.log('plaidSuccessObject in controller', plaidSuccessObject);
//             // //   $http.post("/authenticate", plaidSuccessObject).then(function(response){
//             // //     console.log('in controller back from sending Token', response);
//             // //   });
//             // // };
//             // // $scope.sendTokens = plaidService.sendToken;
//             // // $scope.token = '';
//             // // $scope.plaidIsLoaded = plaidLink.isLoaded;
//             //
//             // plaidLink.create({}, function (public_token, metadata) {
//             // console.log('token', public_token);
//             // console.log('metadata', metadata); // undefined
//             // });
//             //
//             // plaidLink.create({
//             //     selectAccount: true,
//             //     longtail: true,
//             //     onSuccess: function(public_token, metadata) {
//             //         $scope.token = public_token;
//             //         $scope.metadata = metadata;
//             //         var plaid = {};
//             //         plaid.public_token = public_token;
//             //         plaid.account_id = metadata;
//             //         plaidService.sendToken(plaid);
//             //         console.log('public returned token:',plaid);
//             //         // console.log('public returned metadata:', metadata);
//             //
//             //     },
//             //     // success callback
//             //     function(token) {
//             //         console.log('token: ', token);
//             //
//             //         // pass the token to your sever to retrieve an `access_token`
//             //         // see https://github.com/plaid/link#step-3-write-server-side-handler
//             //     },
//             //     onExit: function() {
//             //         console.log('user closed');
//             //     }
//             });
//
//             $scope.openPlaid = function(bankType) {
//                 plaidLink.open(bankType);
//             };
//         }
//     ]);

// angular-stripe stuff
myApp.config(function (stripeProvider) {
  stripeProvider.setPublishableKey('pk_test_C6pNjUH41hCQ87RXmeLBIAa5');
});


myApp.controller('AppCtrl', function($scope) {
  var imagePath = 'img/list/60.jpeg';
  $scope.messages = [{
    face : imagePath,
    what: 'Brunch this weekend?',
    who: 'Min Li Chan',
    when: '3:08PM',
    notes: " I'll be in your neighborhood doing errands"
  }, {
    face : imagePath,
    what: 'Brunch this weekend?',
    who: 'Min Li Chan',
    when: '3:08PM',
    notes: " I'll be in your neighborhood doing errands"
  },  {
    face : imagePath,
    what: 'Brunch this weekend?',
    who: 'Min Li Chan',
    when: '3:08PM',
    notes: " I'll be in your neighborhood doing errands"
  }];
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
    // console.log('bdays', bdays);
    // $http.post("/bdays", bdays).then(function(response){
    //     console.log("back from /bdays! ", response.data);

    // });
  };
});


// module example
myApp.controller('MainCtrl', function($scope, $http) {

  $scope.updateTodo = function(value) {
    console.log('Saving object ' , value);
    $http.post("/bdays", value).then(function(response){
      console.log("back from /bdays! ", response.data);

    });
    // alert('Saving title ' + value);
  };

  $scope.cancelEdit = function(value) {
    console.log('Canceled editing', value);
    alert('Canceled editing of ' + value);
  };

  $scope.todos = [
    {rank: 1, id:123, title: 'Lord of the things'},
    {rank: 2, id:321, title: 'Hoovering heights'},
    {rank: 3, id:231, title: 'Watership brown'}
  ];
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

myApp.controller('XAccountCtrl', function($scope, $timeout) {
  $scope.user = {
    name: 'Ki Le',
    company: "All Nations Translations",
    country: "United States",
    business_type: "LLC.",


  };

  $scope.ranks = [
    {value: 1, text: 'ranks1'},
    {value: 2, text: 'ranks2'},
    {value: 3, text: 'ranks3'},
    {value: 4, text: 'ranks4'}
  ];

  $scope.ages = [
    {value: 32, text: 'age32'},
    {value: 24, text: 'age24'},
    {value: 53, text: 'age53'},
    {value: 8, text: 'age8'}
  ];

  $timeout(function() {
    $scope.textBtnForm.$show();
  }, 1000);


});



// //http://jsfiddle.net/jjdJX/3/ AND  http://stackoverflow.com/questions/16891123/x-editable-input-editable-on-click-on-other-element
// $(function(){
//
//
// $.fn.editable.defaults.mode = 'inline';
// $('#publicname-change').editable({
//     type: 'text',
//     url: '/post',
//     pk: 1,
//     placement: 'top',
//     title: 'Enter public name'
// });
//
// $('.edit').click(function(e){
//        e.stopPropagation();
//        $('#publicname-change').editable('toggle');
//        $('.edit').hide();
// });
//     $(document).on('click', '.editable-cancel, .editable-submit', function(){
//         $('.edit').show();
//     })
// //ajax emulation. Type "err" to see error message
// $.mockjax({
//     url: '/post',
//     responseTime: 100,
//     response: function(settings) {
//         if(settings.data.value == 'err') {
//            this.status = 500;
//            this.responseText = 'Validation error!';
//         } else {
//            this.responseText = '';
//         }
//     }
// });
//
// });

// myApp.controller("ShowController", ["$scope", "$location", '$filter', '$http', "WorkService", 'uiGridConstants', 'stripe', function($scope, $location, $filter, $http, WorkService, uiGridConstants, stripe){
// myApp.controller("ShowController", ["$scope", "$location", '$filter', '$http', "WorkService", 'uiGridConstants', 'stripe', function($scope, $location, $filter, $http, WorkService, uiGridConstants, stripe){

myApp.controller('XAccountCtrl2', ["$scope", "$location", '$anchorScroll','$filter', '$http', '$timeout', '$document', '$mdDialog', "WorkService", 'stripe', 'Upload', function($scope, $location, $anchorScroll, $filter, $http, $timeout, $document, $mdDialog, WorkService, stripe, Upload) {
  var workService = WorkService;

  $scope.localPhoneNumber = '(612) 284-4292';
  $scope.tollfreePhoneNumber = '1-844-669-5264';

  $scope.accountsToVarify = workService.customerPaymentSourceObject.verify;
  // $scope.work.microDepositsExpanded = workService.customerPaymentSourceObject.showMicrodepositDiv;
  $scope.varifiedPaymentSource = workService.customerPaymentSourceObject.varifiedSource;
  $scope.work.microDepositsExpanded = workService.customerPaymentSourceObject.showMicrodepositDiv;

  // $scope.value = workService.customerPaymentSourceObject.showMicrodepositDiv;
  // $scope.value = workService.customerPaymentSourceObject.showMicrodepositDiv;
  workService.getCustomerBalance();
  $scope.customerBalance = workService.customerBalanceObject;

  $scope.scrollTo = function() {
    $scope.work.addPaymentSourceExpanded = true;
    $timeout(function () {
      var el = document.getElementById('smoothscroll'); //https://jsfiddle.net/t34z7/
      angular.element(el).triggerHandler('click');
      // $anchorScroll(id);
    }, 0);
  };


  // $scope.toTheTop = function() {
  //     $document.scrollTopAnimated(0, 5000).then(function() {
  //       console && console.log('You just scrolled to the top!');
  //     });
  //   }
  //   var section3 = angular.element(document.getElementById('section-3'));
  //   $scope.toSection3 = function() {
  //     $document.scrollToElementAnimated(section3);
  //   }


  $scope.logedinUser = WorkService.userObject;
  $scope.user = {
    id: 1,
    name: '',
    currency: 1,
    group: 4,
    groupName: 'admin',
    business_type: 0,
    country: 0

  };

  $scope.currencies = [
    {value: 1, text: 'USD'}
  ];

  $scope.business_types = [
    {value: 1, text: 'Individual'},
    {value: 2, text: 'LLC - Single Member'},
    {value: 3, text: 'LLC - C Corp Tax Class'},
    {value: 4, text: 'LLC - S Corp Tax Class'},
    {value: 5, text: 'LLC - Partnership Tax Class'},
    {value: 6, text: 'C Corporation'},
    {value: 7, text: 'S Corporation'},
    {value: 8, text: 'Partnership'},
    {value: 9, text: 'Non-Profit'}

  ];

  $scope.countries = [
    {value: 1, text: 'US'}
    // {value: 2, text: 'UK'},
    // {value: 3, text: 'Liberia'},
    // {value: 4, text: 'Brazil'}
  ];


  $scope.groups = [];
  $scope.loadGroups = function() {
    return $scope.groups.length ? null : $http.get('/groups').success(function(data) {
      $scope.groups = data;
    });
  };

  $scope.showGroup = function() {
    if($scope.groups.length) {
      var selected = $filter('filter')($scope.groups, {id: $scope.user.group});
      return selected.length ? selected[0].text : 'Not set';
    } else {
      return $scope.user.groupName;
    }
  };

  $scope.checkName = function(data) {
    if (data !== 'All Nations' && data !== 'error') {
      return "Username should be `All Nations` or `error`";
    }
  };

  $scope.saveUserAddress = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateUser/saveUserAddress', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };

  $scope.saveCustomerAddress = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateCustomer/saveCustomerAddress', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };

  $scope.saveUserPhoneEmail = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateUser/saveUserPhoneEmail', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };
  $scope.saveUser = function() {
    // $scope.user already updated!
    console.log('$scope.user', $scope.user);
    return $http.post('/saveUser', $scope.user).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };

  // PAYMENT
  $scope.account_holder_types = [
    {value: 'individual', text: 'individual'},
    {value: 'company', text: 'company'}
  ];

  $scope.payment = {
    check: {
      account_holder_name: '', //Kebeah Johnson
      account_holder_type: 0,
      account_number: '', //000123456789
      routing_number: '', //110000000
      country: "US",
      currency: "USD"
    }
  };

  // START STRIPE Pii
  $scope.Pii = function () {
    console.log('in controller $scope.logedinUser.ssnum::', $scope.logedinUser.ssnum);
    // $scope.payment.check.country = "US";
    // $scope.payment.check.currency = "USD";
    console.log('stripe', stripe);
    // stripe.tokens.create({
    //   pii: {
    //     personal_id_number: '000000000'
    //   }
    // }, function(err, token) {
    //   console.log('pii token', token);
    //   // asynchronously called
    // });

    return stripe.piiData.createToken({personal_id_number: $scope.logedinUser.ssnum}) //$scope.logedinUser.ssnum or '000000000'
    .then(function (response) {
      console.log('token created response ', response);
      // console.log('token created for card ending in ', response.card.last4);
      //  console.log('$scope.logedinUser::', $scope.logedinUser);
      var pii = {};
      pii.piiTokenID = response.id; //reponse.id
      // cardToken.payment = angular.copy($scope.payment);
      // var payment = angular.copy($scope.payment);
      // $scope.payment.check = void 0;
      // payment.token = response.id;
      return $http.post('/updateUser/saveUserPii', pii);
    })
    .then(function (payment) {
      console.log('successfully submitted payment for $', payment);
    })
    .catch(function (err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
      if (err.type && /^Stripe/.test(err.type)) {
        console.log('Stripe error: ', err.message);
      }
      else {
        console.log('Other error occurred, possibly with your API', err.message);
      }



    });
  };
  // END STRIPE Pii

  // START STRIPE BANK ACCOUNT
  $scope.checkAuthorizeCust = function () {
    console.log('in controller $scope.payment.card::', $scope.payment.check);
    // $scope.payment.check.country = "US";
    // $scope.payment.check.currency = "USD";
    // console.log('stripe', stripe);
    console.log('$scope.payment.check', $scope.payment.check);
    return stripe.bankAccount.createToken($scope.payment.check)
    .then(function (response) {
      console.log('token created response ', response);
      // console.log('token created for card ending in ', response.card.last4);
      console.log('$scope.payment::', $scope.payment);
      var check = {};
      check.token = response.id;
      // cardToken.payment = angular.copy($scope.payment);
      // var payment = angular.copy($scope.payment);
      // $scope.payment.check = void 0;
      // payment.token = response.id;
      return $http.post('/updateCustomer/saveCustCheck', check);
    })
    .then(function (payment) {
      console.log('successfully submitted payment for $', payment);
    })
    .catch(function (err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
      if (err.type && /^Stripe/.test(err.type)) {
        console.log('Stripe error: ', err.message);
      }
      else {
        console.log('Other error occurred, possibly with your API', err.message);
      }



    });
  };
  // END STRIPE BANK ACCOUNT

  $scope.updateStripeUserGeneral = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateUser/saveUserGeneral', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };


  $scope.updateStripeCustomerGeneral = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateCustomer/saveCustomerGeneral', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };


  $scope.saveUserSSDOBNAME = function() {
    // $scope.user already updated!
    var logedinUser = $scope.logedinUser.response;
    console.log('logedinUser', logedinUser);
    return $http.post('/updateUser/saveUserSSDOBNAME', logedinUser).error(function(err) {
      if(err.field && err.msg) {
        // err like {field: "name", msg: "Server-side error for this username!"}
        $scope.editableForm.$setError(err.field, err.msg);
      } else {
        // unknown error
        $scope.editableForm.$setError('name', 'Unknown error!');
      }
    });
  };

  // START STRIPE MICRO DEPOSITS FOR BANK ACCOUNT
  $scope.submitBankMicroDeposits = workService.submitBankMicroDeposits;
  // $scope.showme = showmeFactory.showme;


  // START STRIPE CREDIT CARDS
  $scope.charge = function () {
    console.log('in controller $scope.payment.card::', $scope.payment.card);
    $scope.payment.card.currency = 'usd';
    return stripe.card.createToken($scope.payment.card)
    .then(function (response) {
      console.log('token created response ', response);
      console.log('token created for card ending in ', response.card.last4);
      console.log('$scope.payment::', $scope.payment);
      var card = {};
      card.token = response.id;
      // cardToken.payment = angular.copy($scope.payment);
      // var payment = angular.copy($scope.payment);
      // payment.card = void 0;
      // payment.token = response.id;
      return $http.post('/updateUser/stripecc', card);
    })
    .then(function (payment) {
      console.log('successfully submitted payment for $', payment.amount);
    })
    .catch(function (err) {
      if (err.type && /^Stripe/.test(err.type)) {
        console.log('Stripe error: ', err.message);
      }
      else {
        console.log('Other error occurred, possibly with your API', err.message);
      }
    });
  };
  // END STRIPE CREDIT CARDS



  // START STRIPE CREDIT CARDS
  $scope.customerChargeCard = function () {
    console.log('in controller $scope.payment.card::', $scope.payment.card);
    $scope.payment.card.currency = 'usd';
    return stripe.card.createToken($scope.payment.card)
    .then(function (response) {
      console.log('token created response ', response);
      console.log('token created for card ending in ', response.card.last4);
      console.log('$scope.payment::', $scope.payment);
      var card = {};
      card.token = response.id;
      // cardToken.payment = angular.copy($scope.payment);
      // var payment = angular.copy($scope.payment);
      // payment.card = void 0;
      // payment.token = response.id;
      return $http.post('/updateCustomer/stripecc', card);
    })
    .then(function (payment) {
      console.log('successfully submitted payment for $', payment.amount);
    })
    .catch(function (err) {
      if (err.type && /^Stripe/.test(err.type)) {
        console.log('Stripe error: ', err.message);
      }
      else {
        console.log('Other error occurred, possibly with your API', err.message);
      }
    });
  };
  // END STRIPE CREDIT CARDS


  // START OF NG-FILE-UPLOAD STUFF
  // upload later on form submit or something similar
  $scope.submitUpload = function() {
    if ($scope.form.file.$valid && $scope.file) {
      $scope.upload($scope.file);
    }
  };

  // upload on file select or drop
  $scope.upload = function (file) {
    // return $http.post('/updateUser/saveUserIdentityDocument', file).error(function(err) {
    //   if(err.field && err.msg) {
    //     // err like {field: "name", msg: "Server-side error for this username!"}
    //     // $scope.editableForm.$setError(err.field, err.msg);
    //     console.log('err.msg::', err.msg);
    //   } else {
    //     // unknown error
    //     // $scope.editableForm.$setError('name', 'Unknown error!');
    //     console.log('Unknown error!');
    //   }
    // });

    Upload.upload({
      url: '/updateUser/saveUserIdentityDocument', //'upload/url'
      data: {file: file, 'username': $scope.logedinUser.email}
    }).then(function (resp) {
      console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    }, function (evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };
  // for multiple files:
  // $scope.uploadFiles = function (files) {
  //   if (files && files.length) {
  //     for (var i = 0; i < files.length; i++) {
  //       Upload.upload({..., data: {file: files[i]}, ...})...;
  //     }
  //     // or send them all together for HTML5 browsers:
  //     Upload.upload({..., data: {file: files}, ...})...;
  //   }
  // }

  // END OF NG-FILE-UPLOAD STUFF

  //start add input to smart-table
  $scope.inputs = ['Input 1'];

  $scope.counter = 1;

  $scope.addInput = function() {
    $scope.counter++;
    $scope.inputs.push('Input ' + $scope.counter);
  }
  $scope.deleteInput = function(index) {
    console.log('index::', index);
    console.log('$scope.inputs(index::', $scope.inputs[index]);
    $scope.counter--;
    // $scope.inputs.pop(item);
    $scope.inputs.splice(index, 1);
  }



}]);

myApp.controller('XAccountCtrl3', ["$scope", "$location", '$anchorScroll','$filter', '$http', '$timeout', '$document', '$mdDialog', "WorkService", 'stripe', 'Upload', function($scope, $location, $anchorScroll, $filter, $http, $timeout, $document, $mdDialog, WorkService, stripe, Upload) {
  var workService = WorkService;

  $scope.varifiedPaymentSource = workService.customerPaymentSourceObject.varifiedSource;
  $scope.submitRecharge = function(recharge){
    console.log('in controller recharge:::', recharge);
    workService.submitRecharge(recharge);
  }

  // START showRechargeDialog
  $scope.showRechargeDialog = function(ev) {
    console.log("Inside showRechargeDialog function");
    $mdDialog.show({
      controller: RechargeDialogController,
      templateUrl: 'routes/account/rechargeDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      openFrom: {
        top: -50,
        width: 30,
        height: 80
      },
      closeTo: {
        top: 1500
      }
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };
  function RechargeDialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }
  // END showTabDialog

}]);


myApp.controller('XAccountCtrl4', ["$scope", "$location", '$anchorScroll','$filter', '$http', '$timeout', '$document', '$mdDialog', "WorkService", 'stripe', 'Upload', function($scope, $location, $anchorScroll, $filter, $http, $timeout, $document, $mdDialog, WorkService, stripe, Upload) {
  var workService = WorkService;

  $scope.customerChargeMethodChoiceObject = workService.customerChargeMethodChoiceObject;

  $scope.varifiedPaymentSource = workService.customerPaymentSourceObject.varifiedSource;
  $scope.submitCustomerChargeMethodChoice = function(chargeChoice){
    console.log('in controller chargeChoice:::', chargeChoice);
    workService.submitCustomerChargeMethodChoice(chargeChoice);
  }

  $scope.rechargeThresholds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 1000]
  $scope.rechargeAmounts = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090, 1100, 1110, 1120, 1130, 1140, 1150, 1160, 1170, 1180, 1190, 1200, 1210, 1220, 1230, 1240, 1250, 1260, 1270, 1280, 1290, 1300, 1310, 1320, 1330, 1340, 1350, 1360, 1370, 1380, 1390, 1400, 1410, 1420, 1430, 1440, 1450, 1460, 1470, 1480, 1490, 1500, 1510, 1520, 1530, 1540, 1550, 1560, 1570, 1580, 1590, 1600, 1610, 1620, 1630, 1640, 1650, 1660, 1670, 1680, 1690, 1700, 1710, 1720, 1730, 1740, 1750, 1760, 1770, 1780, 1790, 1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000]
  /*
  $scope.rechargeAmounts =
  var rechargeThresholdIncrements = [];
  var createRechargeThresholdArray = function(){
  var finalNum = 1000;
  for (var i = 0; i < finalNum;) {
  var val = i+10;
  rechargeThresholdIncrements.push(val);
  console.log('rechargeThresholdIncrements::', rechargeThresholdIncrements);
  i = i+10;
}
$scope.rechargeThresholds = rechargeThresholdIncrements;
}
createRechargeThresholdArray();
*/
/*
var rechargeAmountIncrements = [];
var createRechargeAmountArray = function(){
var finalNum = 2000;
for (var i = 30; i <= finalNum;) {
var val = i;
rechargeAmountIncrements.push(val);
console.log('rechargeAmountIncrements::', rechargeAmountIncrements);
i = i+10;
}
$scope.rechargeAmounts = rechargeAmountIncrements;
}
createRechargeAmountArray();
*/

$scope.$watch('autoRecharge.rechargeoffon', function(newVal, oldVal) {
  console.log('newVal ::', newVal);
  console.log('oldVal ::', oldVal);
  if (newVal !== oldVal) {
    console.log('newVal !== oldVal');
    // var selected = $filter('filter')($scope.groups, {id: $scope.user.group});
    // $scope.user.groupName = selected.length ? selected[0].text : null;
    // console.log('$scope.user.acc_id::', $scope.user.acc_id);
    // console.log('$scope.user::', $scope.user);
    // console.log('$scope.user.groupName::', $scope.user.groupName);
    // console.log('$scope.groups::', $scope.groups);
    //
    // workService.updateCustomerDefaultPaymentSource($scope.user);

  }
});

// START showAutoChargeDialog
$scope.showChoiceChargeDialog = function(ev, chargeFormType) {
  console.log("Inside showChoiceChargeDialog function chargeFormType::",chargeFormType);
  var templateUrl = '';
  if (chargeFormType == 'autoRecharge') {
    templateUrl = 'routes/account/autoRechargeDialog.tmpl.html';
  }else if(chargeFormType == 'payPerUse'){
    templateUrl = 'routes/account/payAsGochargeDialog.tmpl.html';
  }
  $mdDialog.show({
    controller: AutoRechargeDialogController,
    templateUrl: templateUrl,
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true,
    openFrom: {
      top: -50,
      width: 30,
      height: 80
    },
    closeTo: {
      top: 1500
    }
  })
  .then(function(answer) {
    $scope.status = 'You said the information was "' + answer + '".';
  }, function() {
    $scope.status = 'You cancelled the dialog.';
  });
};
function AutoRechargeDialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}
// END showTabDialog

}]);


myApp.factory("showmeFactory", ["$http", "$location", function($http, $location){

  // var showme = function(){
  //   return true;
  // };
  // var showme =  true;
  //
  // return {
  //     showme : showme
  // };
}]);

myApp.controller('xSelectCtrl', ["$scope", "$location", '$filter', '$http', "WorkService", function($scope, $location, $filter, $http, WorkService) {
  var workService = WorkService;

  $scope.user = workService.customerPaymentSourceObject.default_source;

  $scope.groups = workService.customerPaymentSourceObject.data;

  $scope.loadGroups = function() {
    var userObject = {};
    return $scope.groups.length ? null : $http.get('/user/name').success(function(data) {

      // $scope.groups = data;

      console.log('in controller data::', data);
      userObject.response = data;
      console.log('userObject in controller', userObject);
      console.log('userObject.response.sources.data in controller', userObject.response.sources.data);
      var sourcesLast4Array = [];
      var sourcesArray = userObject.response.sources.data;
      var default_source = userObject.response.sources.default_source;
      var userDefaultSource = {};
      sourcesArray.map(function(obj){
        console.log('controller obj::', obj);
        if (obj.object == "bank_account" && obj.last4 && obj.status == "verified") {
          var groupObj = {id: obj.object+' '+obj.last4, text: obj.object+' '+obj.last4, acc_id: obj.id}
          sourcesLast4Array.push(groupObj);
        }else if (obj.object == "card" && obj.last4) {
          var groupObj = {id: obj.object+' '+obj.last4, text: obj.object+' '+obj.last4, acc_id: obj.id}
          sourcesLast4Array.push(groupObj);
        }
        if (obj.id == default_source) {
          console.log('controller obj default_source::', obj);
          userDefaultSource = {
            group: obj.object +' '+ obj.last4,
            groupName: obj.object +' '+ obj.last4, // original value
            acc_id: obj.id
          };

        }
      });
      // $scope.user = userDefaultSource;
      console.log('sourcesLast4Array::', sourcesLast4Array);
      $scope.groups = sourcesLast4Array;
      // console.log('customerPaymentSourceObject::', customerPaymentSourceObject);


      console.log('default_source on server::', default_source);


    });
  };

  $scope.$watch('user.group', function(newVal, oldVal) {
    console.log('newVal ::', newVal);
    console.log('oldVal ::', oldVal);
    if (newVal !== oldVal) {
      console.log('newVal !== oldVal');
      var selected = $filter('filter')($scope.groups, {id: $scope.user.group});
      $scope.user.groupName = selected.length ? selected[0].text : null;
      console.log('$scope.user.acc_id::', $scope.user.acc_id);
      console.log('$scope.user::', $scope.user);
      console.log('$scope.user.groupName::', $scope.user.groupName);
      console.log('$scope.groups::', $scope.groups);

      workService.updateCustomerDefaultPaymentSource($scope.user);

    }
  });


}]);

myApp.controller('plaidController', ['$scope', 'PlaidService', function($scope, PlaidService) {
  console.log('plaidController loaded');
  var plaidService = PlaidService;
  $scope.plaidObject = {};
  $scope.inside = "inside words";
  $scope.sendDataToBackend = function(plaidSuccessObject){
    console.log('plaidSuccessObject in controller', plaidSuccessObject);
    $http.post("/authenticate", plaidSuccessObject).then(function(response){
      console.log('in controller back from sending Token', response);
    });
  };
  $scope.sendTokens = plaidService.sendToken;
}]);


myApp.controller('SignModalCtrl', [
  '$scope','$window' , 'WorkService', 'Upload',
  function ($scope, $window, WorkService, Upload) {
    var workService = WorkService;
    // $scope.signature.backgroundColor = "rgb(255,255,255)";
    $scope.done = function (signature, work_id) {
      console.log('signature::', signature);
      console.log('work_id: inside of SignModalCtrl:', work_id);
      console.log('signature.toDataURL::', signature.toDataURL());
      var workItemSig = {};
      workItemSig.id = work_id;
      workItemSig.sig = signature.toDataURL();
      console.log('workItemSig::', workItemSig);
      //Send workItemSig to server to be saved in the DB
      workService.completeWork(workItemSig);


      $window.open(signature.toDataURL());
      // var signature = $scope.accept();
      //
      // if (signature.isEmpty) {
      //   //do nothing
      // } else {
      //   //$modalInstance.close(
      //     //upload file
      //     console.log('signature.dataUrl::', signature.dataUrl);
      //     // START OF NG-FILE-UPLOAD STUFF
      //     // upload later on form submit or something similar
      //     $scope.submitUpload = function() {
      //       if ($scope.form.file.$valid && $scope.file) {
      //         $scope.upload($scope.file);
      //       }
      //     };
      //
      //     // upload on file select or drop
      //     $scope.upload = function (file) {
      //         Upload.upload({
      //             url: '/updateUser/saveUserIdentityDocument', //'upload/url'
      //             data: {file: file, 'username': $scope.logedinUser.email}
      //         }).then(function (resp) {
      //             console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      //         }, function (resp) {
      //             console.log('Error status: ' + resp.status);
      //         }, function (evt) {
      //             var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      //             console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      //         });
      //     };
      //     // END OF NG-FILE-UPLOAD STUFF
      //
      // }
    };

    $scope.clear = function (signature) {

      $scope.signature.clear();
    };
  }
]);

myApp.controller('ngSignaturePadController', [
  '$scope',
  function ($scope) {
    $scope.accept = function (signature) {
      console.log('signature', signature);
      // var signature = $scope.accept();
      //
      // if (signature.isEmpty) {
      //   $modalInstance.dismiss();
      // } else {
      //   $modalInstance.close(signature.dataUrl);
      // }
    };
  }
]);

myApp.controller('ModalDemoCtrl', ['$scope', '$uibModal', '$log', function($scope, $uibModal, $log) {
  console.log('ModalDemoCtrl loaded');
  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'sign.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

}]);

myApp.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'items', function($scope, $uibModalInstance, items) {
  console.log('ModalInstanceCtrl loaded');

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

}]);

myApp.controller('exampleController', function ($scope, $log) {
  $scope.query = "";
  $scope.paOptions = {
    updateModel : true
  };
  $scope.paTrigger = {};
  $scope.paDetails = {};
  $scope.placesCallback = function (error, details) {
    console.log($scope.query);
    if (error) {
      return console.error(error);
    }
    $scope.paDetails = details;
  };
});

// http://codepen.io/chrisota/pen/rCGIF
// WIP

/* To Do:
1. Selecting a new plan from the drop down menu will regenerate the data associated below.
2. On-click for description title to show specific description below; one description opens all.
3. Prices recalculate as you select different features.
*/

$('.heading').each(function(){
  var $content = $(this).closest('thead').find('ul');
  $(this).click(function(e){
    e.preventDefault();
    $content.not(':animated').slideToggle();
  });
});

$('.feat td:first-child').each(function(){
  var $content = $(this).closest('table').find('.desc');
  $(this).click(function(e){
    e.preventDefault();
    $content.not(':animated').slideToggle();
  });
});

$("input[type='checkbox']").click(function() {
  if($(this).prop('checked'))
  $(this).closest('td').addClass('color');
  else
  $(this).closest('td').removeClass('color');
});
// http://codepen.io/chrisota/pen/rCGIF


// BEGIN SMART-TABLE STUFF

// END SMART-TABLE STUFF
