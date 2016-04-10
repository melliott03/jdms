myApp.factory("WorkService", ["$http", function($http){
    var data = {};

    var customer = {
      username: "mshell",
      firstname: "Michelle",
      lastname: "Wang",
      datecreated: "2016-04-05T19:27:24.601Z",
      reminderDateTime: "2016-04-05T17:27:24.601Z",
      id: "5704119cba665bdb454ccbe9"
    };
    var contractor = {
      username: "Ab",
      firstname: "Ab",
      lastname: "Sonie",
      datecreated: "2016-04-09T14:05:45.214Z",
      reminderDateTime: "2016-04-09T12:05:45.214Z",
      id: "57090c39560cecb28ac576fe"
    };

    var postWork = function(data){
        $http.post("/work", data).then(function(response){
            console.log("WORK SAVED! ", response);
            data.response = response.data;
            // getWorks();
        });
    };

    var getWorks = function(){
        $http.get("/work").then(function(response){
            console.log(response.data);
            data.response = response.data;
        });
    };

    // var deleteWork = function(work_id){
    // console.log("Deleting work", work_id);
    // $http.delete("/work/" + work_id).then(function(response){
    //     console.log("Deleted : ", response.data);
    //     getWorks();
    // });
    // };
    var cancelWork = function(work_id){
    console.log("Canceling work", work_id);
    $http.put("/work/" + work_id).then(function(response){
        console.log("Canceled : ", response.data);
        getWorks();
    });
    };
    var updateWork = function(work_id){
    console.log("Deleting work", work_id);
    $http.put("/work/" + work_id).then(function(response){
        console.log("Updated : ", response.data);
        getWorks();
    });
    };

    var getSMS = function(){
        $http.get("/sms").then(function(response){
            console.log(response.data);
            data.response = response.data;
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

    return {
        postWork : postWork,
        getWorks : getWorks,
        // deleteWork : deleteWork,
        cancelWork : cancelWork,
        getSMS : getSMS,
        getTravelTime : getTravelTime,
        data : data,
        customer : customer,
        contractor : contractor
    };
}]);
