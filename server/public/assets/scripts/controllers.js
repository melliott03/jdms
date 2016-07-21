
myApp.controller('Ctrl', function($scope) {

});

myApp.controller("AuthenticationController", ["$scope", "$location", "$http", "$window", "AuthenticationService", "WorkService", function($scope, $location, $http, $window, AuthenticationService, WorkService){
    console.log("Authentication Controller");
    var authenticationService = AuthenticationService;
    $scope.logout = function(){
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      userProfile = null;
      window.location.href = "/";
    }

    $scope.user = {email: 'ki.workappdemo@gmail.com', password: '123'};
    $scope.message = '';
    $scope.submit = function () {
      $http
      .post('/api/authenticate', $scope.user)
      .success(function (data, status, headers, config) {
        console.log('in controller data.token::::::',data.token);
        $window.localStorage.token = data.token;
        // console.log('in controller $window.localStorage.token::::::',$window.localStorage.token);

        $scope.message = 'Welcome';
        $window.location.href = '/assets/views/users.html';
      })
      .error(function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.localStorage.token;

        // Handle login errors here
        $scope.message = 'Error: Invalid user or password';
      });
    };
    // WorkService.getWorks(); //this triggers ANOTHER other sms and voice calls
    // WorkService.getAvailibleWorks(); //this triggers ANOTHER other sms and voice calls
    // WorkService.getContractorWork(); //gets all the work contractor has accepted
}]);

myApp.controller("AddController", ["$scope", "$http", "$filter", "$log", "WorkService", function($scope, $http, $filter, $log, WorkService){
  // GoogleController Content
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
    $scope.worklatlon = details.geometry.location;
  };

    var workService = WorkService;
    $scope.data = [];
    var now = new Date(),
    minDate = now.toISOString(); //.substring(0,10)
    $scope.minDate = minDate;


    $scope.myDate = new Date();
  $scope.minDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() - 2,
      $scope.myDate.getDate()
                            );
  $scope.maxDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() + 2,
      $scope.myDate.getDate());
  $scope.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  }





    $scope.works = ['Legal','Social Service','Medical', 'Other', 'Plumber', 'Machenic', 'Marketer', 'Accountant', 'Tutor', 'Painter'];
    $scope.languages = ['Spanish', 'Oromo', 'Somali', 'Hmong'];
    $scope.estimatePriceObject = workService.estimatePriceObject;
    var workItem={};
    $scope.estimatePrice = function(work){
      console.log('moment(work.date)', moment(work.date).toISOString());
      console.log('moment(minDate)', moment(minDate).toISOString());
      if (moment(work.date).isBefore(minDate)){
        console.log('(work.date).isBefore(minDate) is true');

      }
      console.log('work object', work);
      console.log('work.datetime:', work.date);
      workService.estimatePrice(work);
    }


    $scope.setDateErrorMessage = function(work){
      if (moment(work.date).isBefore(moment())){
        $scope.dateErrorMessage_start = 'date cannot be in the past';
        console.log('work.date < $scope.minDate');
      }else if (moment(work.endDateTime).isBefore(moment())) {
        $scope.dateErrorMessage_end = 'date cannot be in the past';
        console.log('work.date < $scope.minDate');
      }
    };

    $scope.submit = function(work){
      console.log('work.endDateTime:', work.endDateTime);
      $scope.dateErrorMessage_start = '';
      $scope.dateErrorMessage_end = '';

      if (moment(work.date).isBefore(moment())){
        $scope.dateErrorMessage_start = 'date cannot be in the past';
        console.log('work.date < $scope.minDate');
      }else if (moment(work.endDateTime).isBefore(moment())) {
        $scope.dateErrorMessage_end = 'date cannot be in the past';
        console.log('work.date < $scope.minDate');
      }
      else{
      console.log('work object', work);
      console.log('work.datetime:', work.date);
      console.log('work.datetime:', work.date.getTime());
      console.log('moment()', moment());
      console.log( 'moment(work.date).isBefore(moment())' , moment(work.date).isBefore( moment() ) );




      workItem.type = work.type;
      workItem.datetime = work.date;
      // workItem.datetime = $filter('date')(work.date, "yyyy-MM-ddTHH:mm:ssZ"); //ISO 8601 datetime string formats (e.g. yyyy-MM-ddTHH:mm:ss.sssZ and its shorter versions like yyyy-MM-ddTHH:mmZ, yyyy-MM-dd or yyyyMMddTHHmmssZ)
      // console.log('workItem.datetime', workItem.datetime);

      // workItem.StartTime = $filter('date')(work.StartTime, "HH:mm");
      workItem.endTime = $filter('date')(work.endDateTime, "HH:mm");
      workItem.address = work.address;
      workItem.details = work.details;
      workItem.customer_id = "";
      workItem.contractor_id = "";
      workItem.status = 'pending';
      // workItem.worklatlon2 = work.location;
      workItem.worklatlon = $scope.worklatlon;


      console.log('Inside AddController WorkService.userObject.id', WorkService.userObject.id);
      console.log('workItem object', workItem);

      WorkService.postWork(workItem);
      }
    };

    $scope.logedinUser = WorkService.userObject;

// ANGULAR-STRAP  ANGULAR-STRAP STUFF
    $scope.modal = {
      "title": "Title",
      "content": "Hello Modal<br />This is a multiline message!"
    };


}]);

myApp.controller("ShowController", ["$scope", "$window", "$location", '$filter', '$http', "WorkService", 'uiGridConstants', 'stripe', '$mdDialog', 'Socket', function($scope, $window, $location, $filter, $http, WorkService, uiGridConstants, stripe, $mdDialog, Socket){
  Socket.connect();
  $scope.$on('$locationChangeStart', function(event){
    Socket.disconnect(true);
  })

  Socket.on('connect', function (msg) {
            console.log("in controller, connected msg,::", msg);
            $http.post("/testExpressSocket", msg).then(function(response){
               console.log('return of updateUserSocketId in controller connect, response.data', response.data);
            });
            var userToken = $window.localStorage.token;
            console.log("in controller, in Socket on 'connect' before emit 'authenticate', userToken::", userToken);
            Socket.emit('authenticate', {token: userToken}); // send the jwt
        });
  Socket.on('connectedSocketID', function (msg) {
            console.log("in controller, connectedSocketID msg,::", msg);
            WorkService.saveSocketId(msg);
        });
  Socket.on('socketToMe', function (msg) {
            console.log("in controller, socketToMe msg,::", msg);
            // WorkService.saveSocketId(msg);
        });
  Socket.on('authenticated', function (msg) {
            //Do
            console.log("in controller, authenticated", msg);
        });
  Socket.on('unauthorized', function(msg){
            console.log("unauthorized: " + JSON.stringify(msg.data));
            throw new Error(msg.data.type);
        });
        // .on('chat message', function (msg) {
        //     console.log("msg");
        //     // $('#messages').append($('<li>').text(msg));
        // });

  var workService = WorkService;

  // $scope.updateWorkEntered = function(work){
  //   console.log('work:::',work);
  // };
  $scope.updateWorkEntered = function(work){
    // check your console
    // console.log('value of your model is now newValue::: ', newValue);
    // console.log('value of your model is now work::: ', work);
    // console.log(' newValue::: ', newValue);
    // console.log(' key::: ', key);
    // console.log(' work::: ', work);

    // var objectKey = "work"+"."+""+key;
    // console.log('without newValue ::: ', objectKey);
    // objectKey = objectKey.replace(/"/g, ""); //remove quotes
    // console.log('after removing quotes objectKey ::: ', objectKey);
    // objectKey = newValue; //remove quotes
    //
    // console.log('after adding key to work object ::: ', objectKey);
    // // objectKey = newValue;
    // // console.log('objectKey with newValue::: ', objectKey);
    //
    // // console.log(' updated work::: ', work);
    //
    //
    //
    // // console.log(JSON.stringify(work));
    //
    workService.updateWork(work);
    // // console.log('value of your model is now: ' + newValue[0]._id);
    // // console.log('value of your model is now: ' + newValue.type);
  };

  $scope.updatedWorkFromDOM = function(work){
    // $scope.updatedWorkFromDOM();
    console.log('UPDATED WORK FROM DOM', work);
  }
  $scope.user = {
    name: 'awesome user'
  };
  $scope.myData = [
        {
            "firstName": "Cox",
            "lastName": "Carney"
      }];
  // WorkService.getMovies();//this triggers my other sms and voice calls
    // WorkService.getSMS(); //this triggers ANOTHER other sms and voice calls
    WorkService.getWorks(); //this triggers ANOTHER other sms and voice calls
    WorkService.getAvailibleWorks(); //this triggers ANOTHER other sms and voice calls
    WorkService.getContractorWork(); //gets all the work contractor has accepted
    // $scope.expand = {};
    $scope.setWorkDetail = function(work) {
      console.log('inside workdtail in controller::::work', work);
      $scope.workdetail = work;
      $location.path('#workdetail');
      // redirectTo: '/';
    };
    $scope.contractor = function(){
      if(WorkService.userObject.response.role == "contractor" ){
          return true;
    }else{
          return false;
    }
  }

  $scope.customer = function(){
    if(WorkService.userObject.response.role == "customer" ){
        return true;
  }else{
        return false;
  }
}

    // console.log('WorkService.userObject.response.role:', WorkService.userObject.response.role);
    $scope.contractorWorks = WorkService.contractorWorkObject;
    $scope.availibleWorks = WorkService.availibleWorkObject;
    // console.log('$scope.availibleWorks :', $scope.availibleWorks);

    $scope.works = WorkService.customerWorkObject;

    $scope.displayWorkCollection = [].concat($scope.works.response);
    // console.log('$scope.works :', $scope.works);
    $scope.deleteWork = WorkService.deleteWork;
    $scope.cancelWork = WorkService.cancelWork;
    $scope.acceptWork = WorkService.acceptWork;
    $scope.completeWork = WorkService.completeWork;

// datatable
    $scope.selected = [];

  $scope.query = {
    order: 'name',
    limit: 5,
    page: 1
  };

  function success(works) {
    $scope.works = works;
  }

  $scope.getTypes = function () {
    return ['Plumer', 'Machenic', 'Marketer', 'Accountant', 'Tutor', 'Painter'];
    // $scope.promise = $nutrition.desserts.get($scope.query, success).$promise;
  };
  //End datatable

// ANGULAR-STRIPE STUFF
  // $scope.submitCC = workService.submitCC;
//   Stripe.card.createToken({
//   number: $('.card-number').val(),
//   cvc: $('.card-cvc').val(),
//   exp_month: $('.card-expiry-month').val(),
//   exp_year: $('.card-expiry-year').val(),
//   address_zip: $('.address_zip').val()
// }, stripeResponseHandler);





  // $scope.bankMicroDeposits = function () {
  //   console.log('in controller $scope.microDeposit::', $scope.microDeposit);
  //   return stripe.bankAccount.createToken($scope.payment.check)
  //     .then(function (response) {
  //       console.log('token created response ', response);
  //       // console.log('token created for card ending in ', response.card.last4);
  //       console.log('$scope.payment::', $scope.payment);
  //       var card = {};
  //       card.token = response.id;
  //       // cardToken.payment = angular.copy($scope.payment);
  //       // var payment = angular.copy($scope.payment);
  //       $scope.payment.check = void 0;
  //       // payment.token = response.id;
  //       return $http.post('/stripecc', card);
  //     })
  //     .then(function (payment) {
  //       console.log('successfully submitted payment for $', payment);
  //     })
  //     .catch(function (err) {
  //       if (err.type && /^Stripe/.test(err.type)) {
  //         console.log('Stripe error: ', err.message);
  //       }
  //       else {
  //         console.log('Other error occurred, possibly with your API', err.message);
  //       }
  //     });
  // };
  // END STRIPE MICRO DEPOSITS FOR BANK ACCOUNT

  // function () {
  //   console.log("hello in submitCC = function");
  // };

// //START Contenteditable
//   $scope.text01 = 'Click here to edit the text.';
//   $scope.text02 = 'You will need to click the button to enable content editing before you can change this text.';
//   $scope.editmode = false;
//   $scope.toggleEditMode = function(){
//     $scope.editmode = $scope.editmode === false ? true: false;
//   }
// //END Contenteditable

//START $mdDialog
$scope.hide = function() {
  $mdDialog.hide();
};
$scope.cancel = function() {
  $mdDialog.cancel();
};
$scope.showTabDialog = function(ev, work_id) {
  console.log("Inside showTabDialog function");
  console.log('work_id', work_id);
  $scope.work_id = work_id;
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'workDialog.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true,
    locals: { items: work_id }
  })
  .then(function(answer) {
    $scope.status = 'You said the information was "' + answer + '".';
  }, function() {
    $scope.status = 'You cancelled the dialog.';
  });
};
function DialogController($scope, $mdDialog, items) {
  console.log('items::', items);
  $scope.work_id = items;

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
//END $mdDialog

//START $mdDialog
$scope.addTabDialog = function(ev) {
  console.log("Inside addTabDialog function");
  $mdDialog.show({
    controller: addDialogController,
    templateUrl: 'addDialog.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true
  })
  .then(function(answer) {
    $scope.status = 'You said the information was "' + answer + '".';
  }, function() {
    $scope.status = 'You cancelled the dialog.';
  });
};
function addDialogController($scope, $mdDialog) { //, items
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
//END $mdDialog

}]); //END

// myApp.directive("contenteditable", function() {//PART OF contente
//   return {
//     require: "ngModel",
//     link: function(scope, element, attrs, ngModel) {
//
//       function read() {
//         ngModel.$setViewValue(element.html());
//       }
//
//       ngModel.$render = function() {
//         element.html(ngModel.$viewValue || "");
//       };
//
//       element.bind("blur keyup change", function() {
//         scope.$apply(read);
//       });
//     }
//   };
// });

myApp.controller("HomeController", ["$scope", "$mdDialog", "HomeService", "WorkService", function($scope, $mdDialog, HomeService, WorkService){

    console.log("Home Controller");
    var homeService = HomeService;
    // WorkService.getTravelTime();

    $scope.showTabDialog = function(ev) {
      console.log("Inside showTabDialog function");
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'tabDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
  };
function DialogController($scope, $mdDialog) {
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

$scope.submitContractorPersonal = homeService.createContractorAccount;

}]);

myApp.controller("CommunicationsController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Communications Controller");

    $scope.data = WorkService.data;
}]);

myApp.controller("GoogleController", ["$scope", "$log", function($scope, $log){
    console.log("Google Controller");
    // GoogleController Content
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
      console.log('inside GoogleController details::', details.geometry);

      $scope.paDetails = details;
      $scope.worklatlon = details.geometry.location;
    };
}]);

myApp.controller("GoogleDisplayController", ["$scope", function($scope, NgMap){
  console.log("Google Map Display Controller");

  NgMap.getMap().then(function(map) {
    console.log(map.getCenter());
    console.log('markers', map.markers);
    console.log('shapes', map.shapes);
  });
}]);

myApp.controller("ChartController", ["$scope", function($scope){
  console.log("Chart Controller");

  $scope.chartObject = {};

   $scope.chartObject.type = "PieChart";

   $scope.onions = [
       {v: "Tutor"},
       {v: 3},
   ];

   $scope.chartObject.data = {"cols": [
       {id: "t", label: "Work", type: "string"},
       {id: "s", label: "Fields", type: "number"}
   ], "rows": [
       {c: [
           {v: "Mechanic"},
           {v: 3},
       ]},
       {c: $scope.onions},
       {c: [
           {v: "Accountant"},
           {v: 31}
       ]},
       {c: [
           {v: "Marketer"},
           {v: 1},
       ]},
       {c: [
           {v: "Other"},
           {v: 2},
       ]}
   ]};

   $scope.chartObject.options = {
       'title': 'Work by type'
   };

// BEGIN CHARTOBJECT_COLUMN
$scope.chartObject_column = {};

   $scope.chartObject_column.type = "ColumnChart";

   $scope.onions = [
       {v: "Tutor"},
       {v: 3},
   ];

   $scope.chartObject_column.data = {"cols": [
       {id: "t", label: "Work", type: "string"},
       {id: "s", label: "Fields", type: "number"}
   ], "rows": [
       {c: [
           {v: "Mechanic"},
           {v: 3},
       ]},
       {c: $scope.onions},
       {c: [
           {v: "Accountant"},
           {v: 31}
       ]},
       {c: [
           {v: "Marketer"},
           {v: 1},
       ]},
       {c: [
           {v: "Other"},
           {v: 2},
       ]}
   ]};

   $scope.chartObject_column.options = {
       'title': 'Work by type'
   };
//END

}]);


myApp.controller("VideoDialogController", ["$scope", "$mdDialog", function($scope, $mdDialog){
  console.log(" Video Dialog Controller");

// BEGIN
$scope.openFromLeft = function(ev) {
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'video.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose:true
  });
    // $mdDialog.show(
    //   $mdDialog.alert()
    //     .clickOutsideToClose(true)
    //     // .templateUrl('tabDialog.tmpl.html')
    //     // .htmlContent('tabDialog.tmpl.html')
    //
    //     .title('Video Conference')
    //     .textContent('Smiles are free')
    //     .ariaLabel('Video Conference')
    //     .ok('Close')
    //     // You can specify either sting with query selector
    //     .openFrom('#center')
    //     // or an element
    //     .closeTo(angular.element(document.querySelector('#bottom')))
    // );
  };
  $scope.openOffscreen = function() {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'tabDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    });
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .htmlContent('<p>tabDialog.tmpl.html</p>')
        // .templateUrl('tabDialog.tmpl.html')
        // .title('Opening from offscreen')
        .textContent('<p>tabDialog.tmpl.html</p>')
        .ariaLabel('Offscreen Demo')
        .ok('Amazing!')
        // Or you can specify the rect to do the transition from
        .openFrom({
          top: -50,
          width: 30,
          height: 80
        })
        .closeTo({
          left: 1500
        })
    );
  };

  function DialogController($scope, $mdDialog) {
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
//END

}]);

myApp.controller('creditCardCtrl', ['$scope', function($scope) {

  $scope.card = {
    name: 'Mike Brown',
    number: '5555 4444 3333 1111',
    expiry: '11 / 2020',
    cvc: '123'
  };

  $scope.cardPlaceholders = {
    name: 'Your Full Name',
    number: 'xxxx xxxx xxxx xxxx',
    expiry: 'MM/YY',
    cvc: 'xxx'
  };

  $scope.cardMessages = {
    validDate: 'valid\nthru',
    monthYear: 'MM/YYYY',
  };

  $scope.cardOptions = {
    debug: false,
    formatting: true
  };

}]);

myApp.controller('checkCtrl', ['$scope', function($scope) {

  var check1 = {
    name: 'Mike Brown',
    bankName: 'Citi Bank',
    accountNumber: '1111111111',
    routingNumber: '222222222',
    order: 'Software'
  };
  var check2 = {
    name: 'Bill Smith',
    bankName: 'BelarusBank',
    accountNumber: '2334567865',
    routingNumber: '235665544',
    order: ''
  };

  var selectedCheck = 1;
  $scope.check = check1;

  $scope.changeCheck = function() {
    if (selectedCheck == 1) {
      $scope.check = check2;
      selectedCheck = 2;
    } else {
      $scope.check = check1;
      selectedCheck = 1;
    }
  };

  $scope.clear = function() {
    $scope.check = {};
  };


  $scope.checkValues = {
    accountNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
    routingNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
    name: 'Full Name',
    bankName: 'Bank Name',
    order: '_________________________'
  };

}]);


myApp.controller('XeditableCtrl', ['$scope', '$filter', '$http', function($scope, $filter, $http) {

  $scope.user = {
     id: 1,
     name: 'awesome user',
     status: 2,
     group: 4,
     groupName: 'admin'
   };

   $scope.statuses = [
     {value: 1, text: 'status1'},
     {value: 2, text: 'status2'},
     {value: 3, text: 'status3'},
     {value: 4, text: 'status4'}
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
     if (data !== 'awesome' && data !== 'error') {
       return "Username should be `awesome` or `error`";
     }
   };

   $scope.saveUser = function() {
     // $scope.user already updated!
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

//Start http://plnkr.co/edit/BjWwXIlYyyLvRnVwO8m8?p=preview
$scope.user = {
    name: 'awesome user',
    status: 2
  };

  $scope.statuses = [
    {value: 1, text: 'status1'},
    {value: 2, text: 'status2'},
    {value: 3, text: 'status3'},
    {value: 4, text: 'status4'}
  ];

  $scope.showStatus = function() {
    var selected = $filter('filter')($scope.statuses, {value: $scope.user.status});
    return ($scope.user.status && selected.length) ? selected[0].text : 'Not set';
  };

}]);
