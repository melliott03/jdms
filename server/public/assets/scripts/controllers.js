myApp.controller("AddController", ["$scope", "$http", "$filter", "WorkService", function($scope, $http, $filter, WorkService){
    $scope.movies = {};
    $scope.data = [];
    var contractor = WorkService.contractor;
    var customer = WorkService.customer;

    $scope.works = ['Plumber', 'Machenic', 'Marketer', 'Accountant', 'Tutor', 'Painter'];

    var workItem={};
    $scope.submit = function(work){
      console.log('work object', work);
      workItem.type = work.type;
      workItem.datetime = $filter('date')(work.date, "yyyy-MM-ddTHH:mm:ss.sssZ"); //ISO 8601 datetime string formats (e.g. yyyy-MM-ddTHH:mm:ss.sssZ and its shorter versions like yyyy-MM-ddTHH:mmZ, yyyy-MM-dd or yyyyMMddTHHmmssZ)
      // workItem.StartTime = $filter('date')(work.StartTime, "HH:mm");
      workItem.endTime = $filter('date')(work.EndTime, "HH:mm");
      workItem.address = work.address;
      workItem.details = work.details;
      workItem.customer_id = customer.id;
      workItem.status = 'pending';


      console.log('workItem object', workItem);

      WorkService.postWork(workItem);
    };

}]);

myApp.controller("ShowController", ["$scope", "WorkService", function($scope, WorkService){
    // WorkService.getMovies();//this triggers my other sms and voice calls
    // WorkService.getSMS(); //this triggers ANOTHER other sms and voice calls
    WorkService.getWorks(); //this triggers ANOTHER other sms and voice calls

    $scope.works = WorkService.data;
    console.log('$scope.works :', $scope.works);
    $scope.deleteWork = WorkService.deleteWork;
    $scope.cancelWork = WorkService.cancelWork;

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
    return ['Plumber', 'Machenic', 'Marketer', 'Accountant', 'Tutor', 'Painter'];
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

myApp.controller("HomeController", ["$scope", "$mdDialog", "WorkService", function($scope, $mdDialog, WorkService){
    console.log("Home Controller");
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


}]);

myApp.controller("CommunicationsController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Communications Controller");

    $scope.data = WorkService.data;
}]);
