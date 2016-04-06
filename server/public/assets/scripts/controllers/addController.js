myApp.controller("AddController", ["$scope", "DataService", function($scope, DataService){
    console.log("Add Controller");

    $scope.animals = ['CAT', 'DOG', 'BIRD', 'BEAR', 'LIZARD', 'HORSE'];

    $scope.submit = function(animal){
        DataService.postAnimal(animal);
    };
}]);
