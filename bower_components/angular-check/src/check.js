angular.module('gavruk.check', [])

.controller('CheckCtrl', function($scope) {
})

.directive('check', function ($compile) {
  return {
    restrict: 'A',
    scope: {
      checkContainer: '@', // required
      width: '@',
      values: '='
    },
    controller: 'CheckCtrl',
    link: function (scope, element, attributes, checkCtrl) {
      var defaultValues = {
        accountNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
        routingNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
        name: 'Full Name',
        bankName: 'Bank Name',
        order: '_________________________'
      };

      var values = angular.extend(defaultValues, scope.values);

      $(element).check({
        // a selector or jQuery object for the container
        // where you want the check to appear
        container: scope.checkContainer, // *required*

        accountNumberInput: checkCtrl.accountNumberInput,
        routingNumberInput: checkCtrl.routingNumberInput,
        nameInput: checkCtrl.nameInput,
        bankNameInput: checkCtrl.bankNameInput,
        orderInput: checkCtrl.orderInput,

        width: scope.width || 350,

        // Default values for rendered fields - options
        values: {
        accountNumber: values.accountNumber,
        routingNumber: values.routingNumber,
        name: values.name,
        bankName: values.bankName,
        order: values.order
        }
      });
    }
  };
})

.directive('checkAccountNumber', function($compile) {
  return {
    restrict: 'A',
    scope: {
      ngModel: '='
    },
    require: ['^check', 'ngModel'],
    link: function (scope, element, attributes, ctrls) {
      cardCtrl = ctrls[0];
      cardCtrl.accountNumberInput = element;
      scope.$watch('ngModel', function(newVal, oldVal) {
        if (!oldVal && !newVal) {
          return;
        }
        if (oldVal === newVal && !newVal) {
          return;
        }
        element.trigger('change');
      });
    }
  };
})

.directive('checkRoutingNumber', function($compile) {
  return {
    restrict: 'A',
    scope: {
      ngModel: '='
    },
    require: ['^check', 'ngModel'],
    link: function (scope, element, attributes, ctrls) {
      cardCtrl = ctrls[0];
      cardCtrl.routingNumberInput = element;
      scope.$watch('ngModel', function(newVal, oldVal) {
        if (!oldVal && !newVal) {
          return;
        }
        if (oldVal === newVal && !newVal) {
          return;
        }
        element.trigger('change');
      });
    }
  };
})

.directive('checkName', function($compile) {
  return {
    restrict: 'A',
    scope: {
      ngModel: '='
    },
    require: ['^check', 'ngModel'],
    link: function (scope, element, attributes, ctrls) {
      cardCtrl = ctrls[0];
      cardCtrl.nameInput = element;
      scope.$watch('ngModel', function(newVal, oldVal) {
        if (!oldVal && !newVal) {
          return;
        }
        if (oldVal === newVal && !newVal) {
          return;
        }
        element.trigger('change');
      });
    }
  };
})

.directive('checkBankName', function($compile) {
  return {
    restrict: 'A',
    scope: {
      ngModel: '='
    },
    require: ['^check', 'ngModel'],
    link: function (scope, element, attributes, ctrls) {
      cardCtrl = ctrls[0];
      cardCtrl.bankNameInput = element;
      scope.$watch('ngModel', function(newVal, oldVal) {
        if (!oldVal && !newVal) {
          return;
        }
        if (oldVal === newVal && !newVal) {
          return;
        }
        element.trigger('change');
      });
    }
  };
})


.directive('checkOrder', function($compile) {
  return {
    restrict: 'A',
    scope: {
      ngModel: '='
    },
    require: ['^check', 'ngModel'],
    link: function (scope, element, attributes, ctrls) {
      cardCtrl = ctrls[0];
      cardCtrl.orderInput = element;
      scope.$watch('ngModel', function(newVal, oldVal) {
        if (!oldVal && !newVal) {
          return;
        }
        if (oldVal === newVal && !newVal) {
          return;
        }
        element.trigger('change');
      });
    }
  };
});

