myApp.controller("ViewController", ["$scope", "DataService", function($scope, DataService){
    DataService.getAnimals();
    $scope.data = DataService.data;
    $scope.pets = $scope.data;

    $scope.deleteAnimal = function(animal){
        console.log("Deleting");
        DataService.deleteAnimal(animal);
    };
}]);
