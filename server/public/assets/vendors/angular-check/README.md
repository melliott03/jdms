angular-check
============

Angular directive for check https://github.com/gavruk/check

![2a051cd700](https://cloud.githubusercontent.com/assets/507195/5537521/238cd276-8ab4-11e4-8792-94e1518713b2.jpg)


## Installation

`bower install angular-check`

##Usage

```html
<form action="#"
    data-check
    data-width="500"
    data-check-container="#check-container"
    data-values="checkValues"
    >

  <div>
      <input placeholder="Bank Name" type="text" check-bank-name data-ng-model="check.bankName" />

      <input placeholder="Full name" type="text" check-name data-ng-model="check.name" />
  </div>
  <div>
      <input placeholder="Routing Number" type="text" check-routing-number data-ng-model="check.routingNumber" />

      <input placeholder="Account Number" type="text" check-account-number data-ng-model="check.accountNumber" />
  </div>
  <div>
      <input placeholder="Order" type="text" check-order data-ng-model="check.order" />
  </div>
</form>

<div id="check-container"></div>
```

```js
angular.module('app', ['gavruk.check'])

.controller('ExampleCtrl', ['$scope', function($scope) {

  $scope.check = {
    name: 'Mike Brown',
    bankName: 'Citi Bank',
    accountNumber: '1111111111',
    routingNumber: '222222222',
    order: 'Software'
  };

  $scope.checkValues = {
    accountNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
    routingNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
    name: 'Full Name',
    bankName: 'Bank Name',
    order: '_________________________'
  };

}]);
```
