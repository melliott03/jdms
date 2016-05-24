var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable']);

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
      otherwise({
          redirectTo: '/home'
      });
}]);
