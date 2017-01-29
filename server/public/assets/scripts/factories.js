myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        // console.log('$window.localStorage.token:::', $window.localStorage.token);
        config.headers.Authorization = ""+$window.localStorage.token;
      }
      // console.log('config.headers.Authorization::::', config.headers.Authorization);
      return config;
    },
    responseError: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
});



myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});


myApp.factory("WorkService", ["$http",'$timeout', function($http, $timeout){ //,"Auth"

    var userObject = {};
    var socketId = '';

    var saveSocketId = function(msg){

      socketId = msg;
       $http.post("/updateUserSocketId", msg).then(function(response){
          console.log('return of updateUserSocketId in factory', response.data);
       });
    };


    var getUser = function(){
        $http.get("/user/name").then(function(response){
            console.log(response.data);
            userObject.response = response.data;
            console.log('userObject in factory', userObject);
            if (userObject.response == "Unauthorized") {
              userObject.isLogin = false;
              // Auth.setUser(false);
            } else {
              userObject.isLogin = true;
              // Auth.setUser(true);
            }


        });
    };



    getUser();
    return {
        getUser : getUser,
        userObject : userObject
    };
}]);

myApp.factory("AuthenticationService", ["$http", "$location", function($http, $location){
    var logout = function(){
       $http.get("/logout").then(function(response){
         console.log('in factory back grom loging out');
       });
    };

    return {
        logout : logout
    };
}]);
