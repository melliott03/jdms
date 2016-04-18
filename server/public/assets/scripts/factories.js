myApp.factory("WorkService", ["$http", function($http){
    var postedWork = {};
    var data = {};
    var userObject = {};
    var availibleWorkObject = {};
    var contractorWorkObject = {};

    var postWork = function(data){
        $http.post("/work", data).then(function(response){
            console.log("WORK SAVED! ", response);
            postedWork.data = response.data;
            // getWorks();
        });
    };

    var getUser = function(){
        $http.get("/user/name").then(function(response){
            console.log(response.data);
            userObject.response = response.data;
            console.log('userObject ', userObject);

        });
    };

    var getWorks = function(){
        $http.get("/work").then(function(response){
            data.response = response.data;
            console.log('RETRUN OF GET WROKS FUNCTION !!! !!!!!  ::  ', response.data);

            // getWeather(response.data);
            // console.log(response.data);
        });
    };


    var getAvailibleWorks = function(){
        $http.get("/work/availibleWork").then(function(response){
            availibleWorkObject.data = response.data;
            console.log('A V A I L I B L E  W O R K  ::  ', response.data);

        });
    };

    var getContractorWork = function(){
        $http.get("/work/contractorWork").then(function(response){
            contractorWorkObject.data = response.data;
            console.log('C O N T R A C T O R   W O R K  ::  ', response.data);

        });
    };


    var deleteWork = function(work_id){
    console.log("Deleting work", work_id);
    $http.delete("/work/" + work_id).then(function(response){
        console.log("Deleted : ", response.data);
        getWorks();
    });
    };
    var cancelWork = function(work_id){
    console.log("Canceling work", work_id);
    $http.put("/work/" + work_id).then(function(response){
        console.log("Canceled : ", response.data);
        getWorks();
    });
    };
    var acceptWork = function(work){
    console.log("inside acceptWork in factory", work);
    $http.put("/work/accept/", work).then(function(response){
        console.log("accepted back from server : ", response.data);
        getWorks();
        getContractorWork();
        getAvailibleWorks();

    });
    };
    var completeWork = function(work){
    console.log("inside completeWork in factory", work);
    $http.put("/work/complete", work).then(function(response){
        console.log("complete back from server : ", response.data);
        getWorks();
    });
    };
    // var updateWork = function(work_id){
    // console.log("Deleting work", work_id);
    // $http.put("/work/" + work_id).then(function(response){
    //     console.log("Updated : ", response.data);
    //     getWorks();
    // });
    // };

    var getSMS = function(){
        $http.get("/sms").then(function(response){
            console.log(response.data);
            data.sms = response.data;
        });
    };
    var travelTimeReturned={};
    var getTravelTime = function(){
       $http.get("/travelTime").then(function(response){
          travelTimeReturned.theTime = response.data;
          console.log('INSIDE RETURN FROM /travelTime');
       });
      //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    };
    // var getForecast={};
    // var getForecast = function(lat, long, time){
    //    $http.get("/travelTime").then(function(response){
    //       travelTimeReturned.theTime = response.data;
    //       console.log('INSIDE RETURN FROM /travelTime');
    //    });
    //   //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    // };

    getUser();
    return {
        postWork : postWork,
        postedWork : postedWork,
        getWorks : getWorks,
        deleteWork : deleteWork,
        acceptWork : acceptWork,
        completeWork : completeWork,
        cancelWork : cancelWork,
        getSMS : getSMS,
        getTravelTime : getTravelTime,
        data : data,
        userObject : userObject,
        availibleWorkObject : availibleWorkObject,
        getAvailibleWorks : getAvailibleWorks,
        getContractorWork : getContractorWork,
        contractorWorkObject : contractorWorkObject
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
