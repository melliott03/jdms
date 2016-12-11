
        myApp.directive('stDateRange', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            require: '^stTable',
            scope: {
                before: '=',
                after: '='
            },
            templateUrl: 'routes/stDateRange.html',
            link: function (scope, element, attr, table) {
                var inputs = element.find('input');
                var inputBefore = angular.element(inputs[0]);
                var inputAfter = angular.element(inputs[1]);
                var predicateName = attr.predicate;
                [inputBefore, inputAfter].forEach(function (input) {
                    input.bind('blur', function () {
                      console.log('scope.isBeforeOpen 0 ::',scope.isBeforeOpen);
                      if (scope.isBeforeOpen == true) {
                        scope.isBeforeOpen = false;
                      }
                      if (scope.isAfterOpen == true) {
                        scope.isAfterOpen = false;
                      }
                        var query = {};
                        if (!scope.isBeforeOpen && !scope.isAfterOpen) {
                          console.log("inside if (!scope.isBeforeOpen && !scope.isAfterOpen)::");
                            if (scope.before) {
                              console.log("inside if (scope.before)::", scope.before);
                                query.before = scope.before;
                            }
                            if (scope.after) {
                              console.log("inside if (scope.after)::", scope.after);
                                query.after = scope.after;
                            }
                            $timeout(function () {
                              scope.$apply(function () {
                                table.search(query, predicateName);
                                // ngModel.$setViewValue(newValue);
                              });
                            }, 0);
                            // scope.$apply(function () {
                            //     table.search(query, predicateName);
                            // })
                        }
                    });
                });
                function open(before) {
                  console.log('before::', before);
                    return function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        if (before) {
                          console.log('inside if (before), before 1::', before);
                          console.log('inside if (before), scope.isAfterOpen 2::', scope.isAfterOpen);
                          console.log('inside if (before), scope.isBeforeOpen 3::', scope.isBeforeOpen);
                            scope.isBeforeOpen = true;
                          console.log('inside if (before), scope.isBeforeOpen 3::', scope.isBeforeOpen);
                        } else {
                          console.log('inside else 2, before 4::', before);
                          console.log('inside else 2, scope.isBeforeOpen 5::', scope.isBeforeOpen);
                          console.log('inside else 2, scope.isAfterOpen before 6::', scope.isAfterOpen);
                            scope.isAfterOpen = true;
                          console.log('inside else 2, scope.isAfterOpen after 7::', scope.isAfterOpen);
                        }
                    }
                }
                scope.openBefore = open(true);
                scope.openAfter = open();
            }
        }
    }])
    .directive('stNumberRange', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            require: '^stTable',
            scope: {
                lower: '=',
                higher: '='
            },
            templateUrl: 'routes/stNumberRange.html',
            link: function (scope, element, attr, table) {
                var inputs = element.find('input');
                var inputLower = angular.element(inputs[0]);
                var inputHigher = angular.element(inputs[1]);
                var predicateName = attr.predicate;
                [inputLower, inputHigher].forEach(function (input, index) {
                    input.bind('blur', function () {
                        var query = {};
                        if (scope.lower) {
                            query.lower = scope.lower;
                        }
                        if (scope.higher) {
                            query.higher = scope.higher;
                        }
                        scope.$apply(function () {
                            table.search(query, predicateName)
                        });
                    });
                });
            }
        };
    }])
    .filter('customFilter', ['$filter', function ($filter) {
        var filterFilter = $filter('filter');
        var standardComparator = function standardComparator(obj, text) {
            text = ('' + text).toLowerCase();
            return ('' + obj).toLowerCase().indexOf(text) > -1;
        };
        return function customFilter(array, expression) {
            function customComparator(actual, expected) {
                var isBeforeActivated = expected.before;
                var isAfterActivated = expected.after;
                var isLower = expected.lower;
                var isHigher = expected.higher;
                var higherLimit;
                var lowerLimit;
                var itemDate;
                var queryDate;
                if (angular.isObject(expected)) {
                    //date range
                    if (expected.before || expected.after) {
                        try {
                            if (isBeforeActivated) {
                                higherLimit = expected.before;
                                itemDate = new Date(actual);
                                queryDate = new Date(higherLimit);
                                if (itemDate > queryDate) {
                                    return false;
                                }
                            }
                            if (isAfterActivated) {
                                lowerLimit = expected.after;
                                itemDate = new Date(actual);
                                queryDate = new Date(lowerLimit);
                                if (itemDate < queryDate) {
                                    return false;
                                }
                            }
                            return true;
                        } catch (e) {
                            return false;
                        }
                    } else if (isLower || isHigher) {
                        //number range
                        if (isLower) {
                            higherLimit = expected.lower;
                            if (actual > higherLimit) {
                                return false;
                            }
                        }
                        if (isHigher) {
                            lowerLimit = expected.higher;
                            if (actual < lowerLimit) {
                                return false;
                            }
                        }
                        return true;
                    }
                    //etc
                    return true;
                }
                return standardComparator(actual, expected);
            }
            var output = filterFilter(array, expression, customComparator);
            return output;
        };
    }]);
