myApp.controller("AddController", ["$scope", "$http", "WorkService", function($scope, $http, WorkService){
    $scope.movies = {};
    $scope.data = [];

    $scope.search = function(data){
      console.log("We are going to go look for ", data);
      // $http.get("http://www.omdbapi.com/?t=" + data.name + "&y=&plot=full&r=json").then(function(response){
      //     console.log(response.data);
      //     $scope.data = [];
      //     $scope.data.push(response.data);
      // });

      console.log("We are going to go look for ", data);
      // $http.get("http://www.omdbapi.com/?t=" + data.name + "&y=&plot=full&r=json").then(function(response){
      //     console.log(response.data);
      //     $scope.data = [];
      //     $scope.data.push(response.data);
      // });
    };

    $scope.addMovie = function(data){
        console.log(data);

        var postObject = {};
        postObject.Title = data.Title;
        postObject.Runtime = data.Runtime;
        postObject.Rated = data.Rated;
        postObject.Actors = data.Actors;
        postObject.Plot = data.Plot;

        WorkService.postMovie(postObject);
    };
}]);

myApp.controller("ShowController", ["$scope", "WorkService", function($scope, WorkService){
    // WorkService.getMovies();//this triggers my other sms and voice calls
    WorkService.getSMS();


    $scope.data = WorkService.data;
}]);

myApp.controller("HomeController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Home Controller");
    WorkService.getSMS();

}]);

myApp.controller("CommunicationsController", ["$scope", "WorkService", function($scope, WorkService){
    console.log("Communications Controller");



    $scope.data = WorkService.data;
}]);
