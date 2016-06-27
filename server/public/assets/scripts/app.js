var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable', 'angular-plaid-link', 'angular-stripe', 'gavruk.card', 'gavruk.check']);

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
      when("/account", {
          templateUrl: "/assets/views/routes/account.html",
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
myApp.directive('inlineEditTwo', function($timeout) {
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


myApp.controller('XAccountCtrl2', function($scope, $filter, $http) {
 $scope.user = {
    id: 1,
    name: 'All Nations',
    status: 2,
    group: 4,
    groupName: 'admin',
    business_type: 0,
    country: 0

  };

  $scope.statuses = [
    {value: 1, text: 'status1'},
    {value: 2, text: 'status2'},
    {value: 3, text: 'status3'},
    {value: 4, text: 'status4'}
  ];

  $scope.business_types = [
    {value: 1, text: 'LLC'},
    {value: 2, text: 'S Corp'},
    {value: 3, text: 'C Corp'},
    {value: 4, text: 'Sole Proprietor'}
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
});
