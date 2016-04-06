myApp.factory("MovieService", ["$http", function($http){
    var data = {};

    var postMovie = function(data){
        $http.post("/work", data).then(function(response){
            console.log("MOVIE SAVED! ", response);
            getMovies();
        });
    };

    var getMovies = function(){
        $http.get("/work").then(function(response){
            console.log(response.data);
            data.response = response.data;
        });
    };

    return {
        postMovie : postMovie,
        getMovies : getMovies,
        data : data
    };
}]);
