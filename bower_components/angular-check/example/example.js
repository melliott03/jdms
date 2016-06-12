angular.module('app', ['gavruk.check'])

.controller('ExampleCtrl', ['$scope', function($scope) {

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
