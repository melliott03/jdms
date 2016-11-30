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

myApp.factory("HomeService", ["$http", function($http){
  var contractorAccountObject = {};
  var createContractorAccount = function(info){
      $http.put("/epirts/create", info).then(function(response){
          contractorAccountObject.response = response.data;
          console.log('RETRUN OF GET WROKS FUNCTION !!! !!!!!  ::  ', response);
      });
  };

  return {
      contractorAccountObject : contractorAccountObject,
      createContractorAccount : createContractorAccount
  };
}]);


myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});


myApp.factory("WorkService", ["$http", function($http){
    var postedWork = {};
    var data = {};
    var customerWorkObject = {};
    var customerWorkTelObject = {};
    var userObject = {};
    var availibleWorkObject = {};
    var contractorWorkObject = {};
    var contractorSwitchStatusObject = {};
    var customerBalanceObject = {};
    var customerChargesObject = {};
    var customerGraphDataObject = {};
    var customerPaymentSourceObject = {};
    var customerDefaultPaymentSourceObject = {};
    var customerChargeMethodChoiceObject = {};
    // var customerInvoicesObject = {};


    var updateCustomerDefaultPaymentSource = function(source){
        $http.post("/updateCustomer/customerDefaultPaymentSource", source).then(function(response){
            customerDefaultPaymentSourceObject.data = response.data;
            console.log('return of customerDefaultPaymentSourceObject ::  ', response.data);
            getUser();
        });
    };

    var getCustomerGraphData = function(dates){
        $http.post("/updateCustomer/customerGraphData", dates).then(function(response){
            customerGraphDataObject.data = response.data;
            console.log('return of getCustomerGraphData ::  ', response.data);

        });
    };

    var getUser = function(){
        $http.get("/user/name").then(function(response){
            console.log(response.data);
            userObject.response = response.data;
            console.log('userObject in factory', userObject);
        });
    };

    var getWorks = function(){
        $http.get("/work").then(function(response){
            customerWorkObject.response = response.data;
            console.log('RETRUN OF GET WROKS FUNCTION response:::  ', response);
            console.log('RETRUN OF GET WROKS FUNCTION response.data:::  ', response.data);
        });
    };

    var getCustomerBalance = function(){
        $http.get("/updateCustomer/customerMoneyBalance").then(function(response){
            customerBalanceObject.response = response.data;
            console.log('RETRUN OF getCustomerBalance FUNCTION response:::  ', response);
            console.log('RETRUN OF getCustomerBalance FUNCTION customerBalanceObject.response:::  ', customerBalanceObject.response);
        });
    };

    var getCustomerCharges = function(){
        $http.get("/updateCustomer/customerMoneyCharges").then(function(response){
            customerChargesObject.response = response.data;
            console.log('RETRUN OF getCustomerCharges FUNCTION response:::  ', response);
            console.log('RETRUN OF getCustomerCharges FUNCTION response.data:::  ', response.data);
        });
    };

    // var getCustomerInvoices = function(){
    //     $http.get("/updateCustomer/customerInvoices").then(function(response){
    //         customerInvoicesObject.response = response.data;
    //         console.log('RETRUN OF getCustomerInvoices FUNCTION response:::  ', response);
    //         console.log('RETRUN OF getCustomerInvoices FUNCTION response.data:::  ', response.data);
    //     });
    // };

    var postWork = function(data){
        $http.post("/work", data).then(function(response){
            console.log("WORK SAVED! ", response);
            postedWork.data = response.data;
            getWorks();
        });
    };

    var getWorksTel = function(){
        $http.get("/work/calls").then(function(response){
            customerWorkTelObject.response = response.data;
            console.log('RETRUN OF GET WROKS_TEL FUNCTION !!! !!!!!  ::  ', response);

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
        getContractorWork();
        getAvailibleWorks();
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
        getContractorWork();
        getAvailibleWorks();
    });
    };
    var updateWork = function(work){
    console.log("Updating in Factory work.type", work.type);
    console.log("Updating in Factory work", work);

    $http.put("/work/update",  work).then(function(response){
        console.log("Updated::::", response.data);
        getWorks();
        getContractorWork();
        getAvailibleWorks();
    });
    };

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
    var CCobject={};
    var submitCC = function(){
       $http.post("/stripecc").then(function(response){
          // travelTimeReturned.theTime = response.data;
          console.log('return of CC response.data', response.data);
       });
      //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    };


    var bankMicroDepositsObject={};
    var submitBankMicroDeposits = function(microDeposits, payment_source_to_varify){
        data = {};
        data.microDeposits = microDeposits;
        data.payment_source_to_varify = payment_source_to_varify;
       $http.post("/stripeMicro", data).then(function(response){
          // travelTimeReturned.theTime = response.data;
          bankMicroDepositsObject.data = response.data;
          console.log('return of CC response.data', response.data);
          getUser();
       });
      //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    };


    var estimatePriceObject={};
    var estimatePrice = function(work){
      // if (work.date < minDate){
      //   console.log('work.date < $scope.minDate');
      // }
      // console.log('work object', work);
      // console.log('work.datetime:', work.date);

       $http.post("/work/estimate", work).then(function(response){
          // travelTimeReturned.theTime = response.data;
          estimatePriceObject.data = response.data;
          console.log('return of CC response.data', response.data);
       });
      //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    };

    var saveSocketId = function(msg){
      // if (work.date < minDate){
      //   console.log('work.date < $scope.minDate');
      // }
      // console.log('work object', work);
      // console.log('work.datetime:', work.date);

       $http.post("/updateUserSocketId", msg).then(function(response){
          // travelTimeReturned.theTime = response.data;
          // estimatePriceObject.data = response.data;
          console.log('return of updateUserSocketId in factory', response.data);
       });
      //  console.log('in getData allPetsReturned outside getcall', allPetsReturned);
    };

    var updateContractorSwitchStatus = function(data){
      console.log('data in updateContractorSwitchStatus::', data);
      if (data.TelStatus == false || data.TelStatus == true ) {
        $http.post("/updateUser/switch/tel", data).then(function(response){
            console.log("SWITCH Tel STATUS UPDATE! ", response);
            contractorSwitchStatusObject.data = response.data;
            getUser();
        });
      } else if (data.OnsiteStatus) {

        $http.post("/switch", data).then(function(response){
            console.log("SWITCH OnsiteStatus STATUS UPDATE! ", response);
            contractorSwitchStatusObject.data = response.data;
            getUser();
        });
      }
    };

    var getUser = function(){
        $http.get("/user/name").then(function(response){
            console.log(response.data);
            userObject.response = response.data;
            console.log('userObject in factory', userObject);
            console.log('userObject.response.sources.data in factory', userObject.response.sources.data);
            var sourcesLast4Array = [];
            sourcesArray = userObject.response.sources.data;
            var sourcesToVarifyArray = [];
            var varifiedSourcesArray = [];

            var default_source = userObject.response.sources.default_source;
            sourcesArray.map(function(obj){
              console.log('obj after sourcesArray.map::', obj);
              if (obj.object == "bank_account" && obj.last4 && obj.status == "verified") {
                var groupObj = {id: obj.object+' '+obj.last4, text: obj.object+' '+obj.last4, acc_id: obj.id}
                sourcesLast4Array.push(groupObj);
                varifiedSourcesArray.push(obj);
              }else if (obj.object == "card" && obj.last4) {
                var groupObj = {id: obj.object+' '+obj.last4, text: obj.object+' '+obj.last4, acc_id: obj.id}
                sourcesLast4Array.push(groupObj);
                varifiedSourcesArray.push(obj);
              }
              console.log('sourcesLast4Array first::', sourcesLast4Array);
              if (obj.id == default_source) {
                console.log('obj default_source::', obj);
                var userSources = {
                  group: obj.object+' '+obj.last4,
                  groupName: obj.object+' '+obj.last4, // original value
                  acc_id: obj.id
                };
                customerPaymentSourceObject.default_source = userSources;
              }

              if (obj.object == 'bank_account' && obj.status && obj.status != 'verified') {
                console.log('obj bank_account needs to be verified::', obj);
                var userSourceToVarify = {
                  object: obj.object,
                  last4: obj.last4,
                  groupName: obj.object+' '+obj.last4, // original value
                  id: obj.id
                };
                sourcesToVarifyArray.push(userSourceToVarify);
              }

            });
            customerPaymentSourceObject.varifiedSource = varifiedSourcesArray;
            customerPaymentSourceObject.verify = sourcesToVarifyArray;
            console.log('sourcesLast4Array::', sourcesLast4Array);
            customerPaymentSourceObject.data = sourcesLast4Array;
            var verifyArray = customerPaymentSourceObject.verify;
            if (verifyArray.length < 1) {
              console.log('inside if verifyArray.length < 1');
              customerPaymentSourceObject.showMicrodepositDiv = false;
            }else {
              console.log('inside else verifyArray.length < 1');
              customerPaymentSourceObject.showMicrodepositDiv = true;
            }
            console.log('customerPaymentSourceObject::', customerPaymentSourceObject);
            console.log('default_source on server::', default_source);
            // var userSources = {
            //   group: 'vip',
            //   groupName: 'vip' // original value
            // };
            // customerPaymentSourceObject.default_source = sourcesLast4Array;

        });
    };

    var submitRecharge = function(data){
        $http.post("/updateCustomer/rechargeCustomerAccount", data).then(function(response){
            // customerDefaultPaymentSourceObject.data = response.data;
            console.log('return of customerDefaultPaymentSourceObject ::  ', response.data);
            getCustomerBalance();
            getUser();
        });
    };
    var submitCustomerChargeMethodChoice = function(data){
        $http.post("/updateCustomer/customerChargeMethodChoice", data).then(function(response){
            // customerDefaultPaymentSourceObject.data = response.data;
            console.log('return of customerChargeMethodChoiceObject ::  ', response.data);
            getCustomerBalance();
            getUser();
        });
    };





    getUser();
    return {
        getUser : getUser,
        postWork : postWork,
        postedWork : postedWork,
        getWorks : getWorks,
        getWorksTel : getWorksTel,
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
        contractorWorkObject : contractorWorkObject,
        updateWork : updateWork,
        customerWorkObject : customerWorkObject,
        customerWorkTelObject : customerWorkTelObject,
        submitCC : submitCC,
        submitBankMicroDeposits:submitBankMicroDeposits,
        bankMicroDepositsObject:bankMicroDepositsObject,
        estimatePrice : estimatePrice,
        estimatePriceObject : estimatePriceObject,
        saveSocketId : saveSocketId,
        updateContractorSwitchStatus: updateContractorSwitchStatus,
        getCustomerBalance : getCustomerBalance,
        customerBalanceObject : customerBalanceObject,
        getCustomerCharges : getCustomerCharges,
        customerChargesObject : customerChargesObject,
        customerGraphDataObject : customerGraphDataObject,
        getCustomerGraphData : getCustomerGraphData,
        updateCustomerDefaultPaymentSource :updateCustomerDefaultPaymentSource,
        customerPaymentSourceObject : customerPaymentSourceObject,
        customerDefaultPaymentSourceObject : customerDefaultPaymentSourceObject,
        submitRecharge: submitRecharge,
        submitCustomerChargeMethodChoice: submitCustomerChargeMethodChoice,
        customerChargeMethodChoiceObject: customerChargeMethodChoiceObject
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

myApp.factory("PlaidService", ["$http", "$location", "WorkService", function($http, $location, WorkService){
  var workService = WorkService;
    var sendCustToken = function(plaid, user){
      console.log(' plaid in factory before  sending Token', plaid);
      console.log(' plaid in factory before  sending Token', plaid);

       $http.post("/updateCustomer/saveCustomerPlaidToken", plaid).then(function(response){
         console.log('in factory back from sending Token', response);
         workService.getUser();
       });
    };

    var sendContToken = function(plaid, user){
      console.log(' plaid in factory before  sending Token', plaid);
      console.log(' plaid in factory before  sending Token', plaid);

       $http.post("/updateUser/saveUserPlaidToken", plaid).then(function(response){
         console.log('in factory back from sending Token', response);
         workService.getUser();
       });
    };

    return {
        sendContToken : sendContToken,
        sendCustToken: sendCustToken
    };
}]);

// SOCKET
myApp.factory("Socket", [ "socketFactory", function(socketFactory){
    return socketFactory();
}]);

myApp.factory('SmartTableWorkService', ['$q', '$filter', '$timeout', '$http', function ($q, $filter, $timeout, $http) {

  var getWorks = function(){
      $http.get("/work").then(function(response){
          console.log('RETRUN OF GET WROKS FUNCTION response:::  ', response);
          console.log('RETRUN OF GET WROKS FUNCTION response.data::: filtering sorting ', response.data);

          return response.data;


          // getWeather(response.data);
          // console.log(response.data);
      });
  };

	//this would be the service to call your server, a standard bridge between your model an $http

	// the database (normally on your server)
	var randomsItems = [];

	function createRandomItem(id) {
		var heroes = ['Batman', 'Superman', 'Robin', 'Thor', 'Hulk', 'Niki Larson', 'Stark', 'Bob Leponge'];
		return {
			id: id,
			name: heroes[Math.floor(Math.random() * 7)],
			age: Math.floor(Math.random() * 1000),
			saved: Math.floor(Math.random() * 10000)
		};

	}

	for (var i = 0; i < 1000; i++) {
		randomsItems.push(createRandomItem(i));
	}

  var workItems = getWorks();



	//fake call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
	//in our case, it actually performs the logic which would happened in the server
	function getPage(start, number, params) {
      console.log('inside getPage');
    function getWorks(){
        $http.get("/work").then(function(response){
            console.log('RETRUN OF GET WROKS FUNCTION response:::  ', response);
            console.log('RETRUN OF GET WROKS FUNCTION response.data::: filtering sorting ', response.data);

             var workItems =  response.data;


            var deferred = $q.defer();
            var workItemsToSend = {};


            var filtered = params.search.predicateObject ? $filter('filter')(workItems, params.search.predicateObject) : workItems;

            if (params.sort.predicate) {
              filtered = $filter('orderBy')(filtered, params.sort.predicate, params.sort.reverse);
            }

            var result = filtered.slice(start, start + number);

            $timeout(function () {
              //note, the server passes the information about the data set size
              workItemsToSend = {
                data: result,
                numberOfPages: Math.ceil(1000 / number)
              };
            });

            console.log('workItemsToSend::', workItemsToSend);

            return workItemsToSend;

        });
    };



	}

	return {
		getPage: getPage
	};

}]);
