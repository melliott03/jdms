var myApp = angular.module("myApp", ['ngMaterial', 'ngMessages', 'ngRoute', 'md.data.table', 'ngPlacesAutocomplete', 'ngMap', 'uiGmapgoogle-maps', 'googlechart', 'ngAnimate', 'ngTouch', 'ui.grid', 'smart-table', 'ui.bootstrap', 'wt.responsive', 'angularInlineEdit', 'xeditable', 'angular-plaid-link', 'angular-stripe', 'gavruk.card', 'gavruk.check', 'ngFileUpload']);

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
      when("/accountCont", {
          templateUrl: "/assets/views/routes/account-contractor.html",
          controller: "ShowController"
      }).
      when("/accountCust", {
          templateUrl: "/assets/views/routes/account-customer.html",
          controller: "ShowController"
      }).
      otherwise({
          redirectTo: '/home'
      });
}]);

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

// myApp.controller("ShowController", ["$scope", "$location", '$filter', '$http', "WorkService", 'uiGridConstants', 'stripe', function($scope, $location, $filter, $http, WorkService, uiGridConstants, stripe){
// myApp.controller("ShowController", ["$scope", "$location", '$filter', '$http', "WorkService", 'uiGridConstants', 'stripe', function($scope, $location, $filter, $http, WorkService, uiGridConstants, stripe){

myApp.controller('XAccountCtrl2', ["$scope", "$location", '$filter', '$http', "WorkService", 'stripe', 'Upload', function($scope, $location, $filter, $http, WorkService, stripe, Upload) {
  var workService = WorkService;
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
  $scope.ccAuthorize = function () {
    console.log('in controller $scope.payment.card::', $scope.payment.check);
    // $scope.payment.check.country = "US";
    // $scope.payment.check.currency = "USD";
    console.log('stripe', stripe);
    return stripe.bankAccount.createToken($scope.payment.check)
      .then(function (response) {
        console.log('token created response ', response);
        // console.log('token created for card ending in ', response.card.last4);
        console.log('$scope.payment::', $scope.payment);
        var card = {};
        card.token = response.id;
        // cardToken.payment = angular.copy($scope.payment);
        // var payment = angular.copy($scope.payment);
        // $scope.payment.check = void 0;
        // payment.token = response.id;
        return $http.post('/stripecc', card);
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
