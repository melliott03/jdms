
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

myApp.controller("AddController", ["$scope", "$http", "$filter", "WorkService", function($scope, $http, $filter, WorkService){

    $scope.data = [];

    $scope.works = ['Plumber', 'Machenic', 'Marketer', 'Accountant', 'Tutor', 'Painter'];

    var workItem={};
    $scope.submit = function(work){
      console.log('work object', work);
      console.log('work.datetime:', work.date);
      console.log('work.datetime:', work.date.getTime());



      workItem.type = work.type;
      workItem.datetime = work.date;
      // workItem.datetime = $filter('date')(work.date, "yyyy-MM-ddTHH:mm:ssZ"); //ISO 8601 datetime string formats (e.g. yyyy-MM-ddTHH:mm:ss.sssZ and its shorter versions like yyyy-MM-ddTHH:mmZ, yyyy-MM-dd or yyyyMMddTHHmmssZ)
      // console.log('workItem.datetime', workItem.datetime);

      // workItem.StartTime = $filter('date')(work.StartTime, "HH:mm");
      workItem.endTime = $filter('date')(work.EndTime, "HH:mm");
      workItem.address = work.address;
      workItem.details = work.details;
      workItem.customer_id = "";
      workItem.contractor_id = "";
      workItem.status = 'pending';


      console.log('Inside AddController WorkService.userObject.id', WorkService.userObject.id);
      console.log('workItem object', workItem);

      WorkService.postWork(workItem);
    };

    $scope.logedinUser = WorkService.userObject;
}]);

myApp.controller("ShowController", ["$scope", "$location", '$filter', "WorkService", 'uiGridConstants',  function($scope, $location, $filter, WorkService, uiGridConstants){
  // document.body.addEventListener('DOMSubtreeModified', function(event) {
  //   var targets = document.getElementsByClassName('target');
  //   console.log('targets::',targets);
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
    console.log('$scope.availibleWorks :', $scope.availibleWorks);

    $scope.works = WorkService.customerWorkObject;
    console.log('$scope.works :', $scope.works);
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

// //START Contenteditable
//   $scope.text01 = 'Click here to edit the text.';
//   $scope.text02 = 'You will need to click the button to enable content editing before you can change this text.';
//   $scope.editmode = false;
//   $scope.toggleEditMode = function(){
//     $scope.editmode = $scope.editmode === false ? true: false;
//   }
// //END Contenteditable
}]);
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
