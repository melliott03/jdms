
myApp.controller('Ctrl', function($scope) {

});
myApp.controller('NavCtrl', function($scope, $location) {
  $scope.show = 1;

  $scope.collection = [
    {number:'1', path: 'home', name: '../img/icons/ic_home_black_24px.svg'},
    {number:'2', path: 'phone', name: '../img/icons/ic_call_black_24px.svg'},
    {number:'3', path: 'onsite', name: '../img/icons/ic_business_black_24px.svg'},
    {number:'4', path: 'videoCust', name: '../img/icons/ic_videocam_black_24px.svg'},
    {number:'5', path: 'translateCust', name: '../img/icons/ic_translate_black_24px.svg'},
    {number:'6', path: 'accountCust', name: '../img/icons/ic_settings_black_24px.svg'}
];
  // $scope.selectedIndex = 0;
  // when($location.path() == )
  var pathdata = $location.path().split('/');
  console.log('pathdata::', pathdata);
  console.log('pathdata[1]::', pathdata[1]);

  console.log('not click $location.path()::', $location.path());
  if (pathdata[1] == 'home') {
    $scope.selectedIndex = 0;
    $scope.show = '1';
    $location.path('home');
  } else if (pathdata[1] == 'phone'){
    $scope.selectedIndex = 1;
    $scope.show = '2';
    $location.path('phone');
  } else if (pathdata[1] == 'onsite'){
    $scope.selectedIndex = 2;
    $scope.show = '3';
    $location.path('onsite');
  } else if (pathdata[1] == 'videoCust'){
    $scope.selectedIndex = 3;
    $scope.show = '4';
    $location.path('videoCust');
  } else if (pathdata[1] == 'translateCust'){
    $scope.selectedIndex = 4;
    $scope.show = '5';
    $location.path('translateCust');
  } else if (pathdata[1] == 'accountCust'){
    $scope.selectedIndex = 5;
    $scope.show = '6';
    $location.path('accountCust');
  } else {
  }

  $scope.itemClicked = function ($index, item) {
    console.log('inside $scope.itemClicked $index::', $index);
    console.log('inside $scope.itemClicked item::', item);

    $scope.selectedIndex = $index;
    $scope.show = item.number;
    $location.path(item.path);
    console.log('$location.path() in NavCtrl::', $location.path());

    var pathdata = $location.path().split('/');
    console.log('pathdata::', pathdata);
    console.log('pathdata[1]::', pathdata[1]);

    console.log('been clicked $location.path()::', $location.path());
    if (pathdata[1] == 'home') {
      $scope.selectedIndex = 0;
    } else if (pathdata[1] == 'phone'){
      $scope.selectedIndex = 1;
    } else if (pathdata[1] == 'onsite'){
      $scope.selectedIndex = 2;
    } else if (pathdata[1] == 'videoCust'){
      $scope.selectedIndex = 3;
    }else if (pathdata[1] == 'translateCust'){
      $scope.selectedIndex = 4;
    }else if (pathdata[1] == 'accountCust'){
      $scope.selectedIndex = 5;
    }else {
    }

  }
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
    // http://ngmodules.org/modules/ngAutocomplete

  console.log('inside AddController');





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


// moment().seconds(duration);
// var duration = moment().seconds('123').format("mm:ss");
// console.log('convert seconds to HH:MM duration::', duration);


// moment("123", "hmm").format("HH:mm") === "01:23"
// moment(duration, "ss").format("HH:mm") === "01:23"


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
}]);

myApp.controller("ShowController", ["$scope", "$interval", "$window", "$location", '$filter', '$http', '$log', "WorkService", 'uiGridConstants', 'stripe', '$mdDialog', 'Socket', function($scope, $interval, $window, $location, $filter, $http, $log, WorkService, uiGridConstants, stripe, $mdDialog, Socket){
  console.log('Inside ShowController:::');
  this.$onInit = function() {
    this.state = 'Loaded!';
  };
  var workService = WorkService;
  // WorkService.getMovies();//this triggers my other sms and voice calls
    // WorkService.getSMS(); //this triggers ANOTHER other sms and voice calls
    workService.getWorks(); //this triggers ANOTHER other sms and voice calls
    workService.getWorksTel();
    workService.getAvailibleWorks(); //this triggers ANOTHER other sms and voice calls
    workService.getContractorWork(); //gets all the work contractor has accepted
    workService.getCustomerBalance();
    workService.getCustomerCharges();


  // console.log('$routeParams in ShowController::', $routeParams);
  // console.log('$routeParams::', $routeParams.qa_id);

   //Secket.io suff turning off to code further
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

  Socket.on('socketToYou', function (msg) {
            console.log("in controller, socketToYou msg, BEFORE::", msg);
            $scope.myVar = true;
            $scope.determinateTimeValue = 0;
            var TimeValue = 1000;
            // $scope.ding = WorkService.audioDing;
            // function setDelay(i) {
            //   $timeout(function(){
            //     $scope.determinateTimeValue = i;
            //     console.log(i);
            //   }, 1000);
            // };
            //
            // for (i = 1; i <= 100; ++i) {
            //   setDelay(i);
            // };



              var iterrateVal = .1;
              var i = 0;
              $interval(function () {
                if (i < TimeValue) {
                  $scope.determinateTimeValue += iterrateVal;
                  i++;
                } else {

                }

              }, 100);
            console.log("in controller, socketToYou msg, AFTER::", msg);

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

  $scope.admin = function(){
    if(WorkService.userObject.response.role == "admin" ){
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

    //Phone Call Version    $scope.works = WorkService.customerWorkObject;
    $scope.works_tel = WorkService.customerWorkTelObject;
    $scope.displayWorkTelCollection = [].concat($scope.works_tel.response);

    $scope.customerBalance = workService.customerBalanceObject;
    $scope.customerCharges = workService.customerChargesObject;


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
function addDialogController($scope, $mdDialog, $log) { //, items
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
$scope.hide = function() {
  $mdDialog.hide();
};
$scope.cancel = function() {
  $mdDialog.cancel();
};
$scope.EditWorkTabDialog = function(ev, work_id) {
  console.log("Inside EditWorkTabDialog function");
  console.log('work_id', work_id);
  $scope.work_id = work_id;
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'adminAddDialog.tmpl.html',
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
function EditWorkController($scope, $mdDialog, items) {
  console.log('items::', items);
  $scope.work = items;
  // $scope.loadGroups = function() {
  //   return $scope.groups.length ? null : $http.get('/groups').success(function(data) {
  //     $scope.groups = data;
  //   });
  // };

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
$scope.hide = function() {
  $mdDialog.hide();
};
$scope.cancel = function() {
  $mdDialog.cancel();
};
$scope.DuplicateWorkTabDialog = function(ev, work_id) {
  console.log("Inside duplicateTabDialog function");
  console.log('work_id', work_id);
  $scope.work_id = work_id;
  $mdDialog.show({
    controller: DuplicateWorkController,
    templateUrl: 'adminAddDialog.tmpl.html',
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
function DuplicateWorkController($scope, $mdDialog, items) {
  console.log('inside DuplicateWorkController:::');
  console.log('items::', items);
  $scope.work = items;
  // $scope.loadGroups = function() {
  //   return $scope.groups.length ? null : $http.get('/groups').success(function(data) {
  //     $scope.groups = data;
  //   });
  // };

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

//start add row to smart-table
$scope.rows = ['Search 1'];

$scope.counter = 1;

$scope.addRow = function() {
  $scope.counter++;
  $scope.rows.push('Search ' + $scope.counter);
}
$scope.deleteRow = function(index) {
  console.log('index::', index);
  console.log('$scope.rows(index::', $scope.rows[index]);
  $scope.counter--;
  // $scope.rows.pop(item);
  $scope.rows.splice(index, 1);
}
// $scope.removeItem = function(index){
//     $scope.items.splice(index, 1);
//   }
//end add row to smart-table

//TOTALLING CUSTOMER AND CONTRACTOR MONEY
$scope.workNumbers = [{
        val: 100,
        qty: 200,
      }];


      $scope.add = function() {
        $scope.workNumbers.push({
          val: 0,
          qty: 0
        });
      };

      $scope.deleteNumber = function(val) {
        $scope.workNumbers.splice(val, 1);
      };

      $scope.total = function(){
        var total = 0;
        angular.forEach($scope.workNumbers, function(num) {
          total += (num.val * num.qty);
        });
        return total;
      }
      $scope.work = {};
      $scope.work.details = {};

      $scope.work.details.aRate = 20;
      $scope.work.details.aDuration = 2;
      $scope.work.details.aMiles = 0;
      $scope.work.details.aMileRate = 0;
      $scope.work.details.aTravelRate = 0;
      $scope.work.details.aTravelTime = 0;
      $scope.work.details.atotal = 0;

      $scope.work.details.cRate = 75;
      $scope.work.details.cDuration = 2;
      $scope.work.details.cMiles = 90;
      $scope.work.details.cMileRate = .54;
      $scope.work.details.cTravelRate = 0;
      $scope.work.details.cTravelTime = 0;
      $scope.work.details.ctotal = 0;

      $scope.work.details.requester = 'William Carvajal';
      $scope.work.details.doctor = 'Dr. Steven Rothke';
      $scope.work.details.patient = 'Mondg Kor';
      $scope.work.details.po = '1009876';
      $scope.work.address = '3710 Commercial Ave Suite 6, NORTHBROOK, COOK, ILLINOIS, 60062';






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

myApp.controller('pipeCtrl', ['SmartTableWorkService', function (SmartTableWorkService) {
  var smartTableWorkService = SmartTableWorkService;
  var ctrl = this;

  this.displayed = [];

  this.callServer = function callServer(tableState) {

    ctrl.isLoading = true;

    var pagination = tableState.pagination;

    var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    var number = pagination.number || 10;  // Number of entries showed per page.

    smartTableWorkService.getPage(start, number, tableState).then(function (result) {
      console.log('result::', result);
      ctrl.displayed = result.data;
      tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
      ctrl.isLoading = false;
    });
  };

}]);

myApp.controller("AutocompleteController", ["$scope", "$http", "WorkService", function($scope, $http, WorkService){
    console.log("AutocompleteController Controller");
    // $scope.data = WorkService.data;
    this.querySearch = function(query){
            return $http.get("/company/list", {params: {q: query}})
            .then(function(response){
              console.log('response.data:::', response.data);
              return response.data;
            });
          };
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

myApp.controller("VideoDialogController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Communications Controller");

    $scope.data = WorkService.data;
}]);

myApp.controller("VideoChatController", ["$scope", "$log", "WorkService", function($scope, $log, WorkService){
    console.log("VideoChatController Controller");

    var vm = this;

    $scope.data = WorkService.data;
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

myApp.controller("CommunicationsController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Communications Controller");

    $scope.data = WorkService.data;
}]);

myApp.controller("SwitchCtrl", ["$scope", "WorkService", function($scope, WorkService){
  console.log("SwitchCtrl Controller");

  // console.log('$scope.logedinUser.response.switchs.tel::', $scope.logedinUser.response.switchs.tel);
  var workService = WorkService;
  // var logedinUser = workService.userObject;
  // console.log('logedinUser::', logedinUser);
  console.log('workService.userObject.response.switchs::', workService.userObject.response.switchs);
  console.log('workService.userObject.response.switchs.tel::', workService.userObject.response.switchs.tel);
  console.log('workService.userObject.response.switchs.onSite::', workService.userObject.response.switchs.onSite);

  // console.log('logedinUser.response.switchs.onSite::', logedinUser.response.switchs.onSite);

  $scope.data = {
    cb1: workService.userObject.response.switchs.tel,
    cb2: workService.userObject.response.switchs.onSite
    // ,
    // cb5: workService.userObject.response.switchs.onSite
  };

  $scope.message = 'false';

  $scope.onChangeOnsite = function(cbState) {
  	$scope.message = cbState;
    console.log('onChangeOnsite cbState:::', cbState);
    workService.updateContractorSwitchStatus({'OnsiteStatus': cbState});
  };
  $scope.onChangeTel = function(cbState) {
  	$scope.message = cbState;
    console.log('onChangeTel cbState:::', cbState);
    workService.updateContractorSwitchStatus({'TelStatus': cbState});
  };
}]);


// myApp.controller('XeditableCtrl', ['$scope', '$filter', '$http', function($scope, $filter, $http) {
//
//    $scope.loadGroups = function() {
//      time = 0;
//      time++;
//      return $scope.
//    };
//
//
// }]);
