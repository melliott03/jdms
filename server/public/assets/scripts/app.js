var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable', 'angular-plaid-link']);

myApp.config(['$mdThemingProvider', function($mdThemingProvider){
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('grey');
}]);

myApp.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('YYYY-MM-DD');
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

myApp.config(["$routeProvider", function($routeProvider){
  $routeProvider.
      when("/home", {
          templateUrl: "/assets/views/routes/home.html",
          controller: "HomeController"
      }).when("/availibleView", {
          templateUrl: "/assets/views/routes/availibleView.html",
          controller: "ShowController"
      }).when("/acceptedView", {
          templateUrl: "/assets/views/routes/accepted.html",
          controller: "ShowController"
      }).
      when("/add", {
          templateUrl: "/assets/views/routes/add.html",
          controller: "AddController"
      }).
      when("/view", {
          templateUrl: "/assets/views/routes/view.html",
          controller: "ShowController"
      }).
      when("/workdetail", {
          templateUrl: "/assets/views/routes/workdetail.html",
          controller: "ShowController"
      }).
      when("/terms", {
          templateUrl: "/assets/views/routes/terms.html",
          controller: "ShowController"
      }).
      otherwise({
          redirectTo: '/home'
      });
}]);

// PLAID stuff
myApp.config([
        'plaidLinkProvider',

        function(plaidLinkProvider) {
            plaidLinkProvider.init({
                selectAccount: true,
                clientName: 'NowLanguage',
                env: 'tartan',
                key: 'test_key',
                product: 'auth',
                onLoad: function() {
                  console.log('modal loaded');
                  // The Link module finished loading.
                },
                onSuccess: function(public_token, metadata) {
                    // $scope.token = public_token;
                    var plaid = {};
                    plaid.public_token = public_token;
                    // plaid.account_id = metadata.account_id;
                    // plaidService.sendToken(plaid);
                    console.log('public returned token:',plaid);
                    console.log('public returned metadata:', metadata);
                }
            });
        }
    ]).controller('plaidCtrl', [
        '$scope',
        'plaidLink',
        'PlaidService',

        function($scope, plaidLink, PlaidService) {
            var plaidService = PlaidService;
            $scope.plaidObject = {};
            $scope.sendDataToBackend = function(plaidSuccessObject){
              console.log('plaidSuccessObject in controller', plaidSuccessObject);
              $http.post("/authenticate", plaidSuccessObject).then(function(response){
                console.log('in controller back from sending Token', response);
              });
            };
            $scope.sendTokens = plaidService.sendToken;
            $scope.token = '';
            $scope.plaidIsLoaded = plaidLink.isLoaded;

            // plaidLink.create({}, function (public_token, metadata) {
            // console.log('token', public_token);
            // console.log('metadata', metadata); // undefined
            // });

            plaidLink.create({
                // onSuccess: function(public_token, metadata) {
                //     $scope.token = public_token;
                //     var plaid = {};
                //     plaid.public_token = public_token;
                //     // plaid.account_id = metadata.account_id;
                //     plaidService.sendToken(plaid);
                //     console.log('public returned token:',plaid);
                //     // console.log('public returned metadata:', metadata);
                // },
                onExit: function() {
                    console.log('user closed');
                }
            });

            $scope.openPlaid = function(bankType) {
                plaidLink.open(bankType);
            };
        }
    ]);
