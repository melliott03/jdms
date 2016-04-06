myApp.factory("DataService", ["$http", function($http){
    var data = {};

    var getAnimals = function(){
        $http.get("/animal").then(function(response){
            data.response = response.data;
        });
    };

    var postAnimal = function(animal){
        $http.post("/animal", animal).then(function(response){
            getAnimals();
        });
    };

    var deleteAnimal = function(animal){
        console.log("Deleting animal");
        $http.delete("/animal/" + animal._id).then(function(response){
            console.log("Deleted : ", response.data);
            getAnimals();
        });
    };

    return {
        data : data,
        getAnimals : getAnimals,
        postAnimal : postAnimal,
        deleteAnimal : deleteAnimal
    };
}]);
