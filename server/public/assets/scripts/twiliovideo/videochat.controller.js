myApp.controller("VideoChatController", ['$scope', '$log', '$http', 'tokenService', function($scope, $log, $http, tokenService){
    console.log("VideoChatController Controller");
    // $scope.data = WorkService.data;
    this.querySearch = function(query){
            return $http.get("/company/list", {params: {q: query}})
            .then(function(response){
              console.log('response.data:::', response.data);
              return response.data;
            });
          };


    //My own stuff

    $scope.submitVideo = function (video) {
      console.log('inside submitVideo controller 1');
      $http.post('/video/new', $scope.video)
      .success(function (data, status, headers, config) {
        console.log('in controller data::::::',data);
        // $window.localStorage.token = data.token;
        // console.log('in controller $window.localStorage.token::::::',$window.localStorage.token);

        // $scope.message = 'Welcome';
        // $window.location.href = '/assets/views/users.html';
      })
      .error(function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        // delete $window.localStorage.token;

        // Handle login errors here
        // $scope.message = 'Error: Invalid user or password';
      });
    };

}]);


(function() {
    'use strict';

    angular
        .module('myApp.videochat', [])
        .controller('VideoChatController', VideoChatController);

    VideoChatController.$inject = ['$scope', '$log', '$http', 'tokenService'];

    function VideoChatController($scope, $log, $http) {
        var vm = this;
        var token;
        var identity;
        var conversationsClient;
        var activeConversation;
        vm.previewMedia;
        vm.clientConnected = false;
        vm.remoteParticipants = {};

        function getToken() {
            return tokenservice.getToken()
                .then(function(data) {
                    token = data.token;
                    identity = data.identity;
                    return token;
                });
        }

        activate();

        function activate() {
            return getToken().then(function(token) {
                var accessManager = new Twilio.AccessManager(token);

                conversationsClient = new Twilio.Conversations.Client(accessManager);

            });
        }

        return getToken().then(function(token) {
            var accessManager = new Twilio.AccessManager(token);

            conversationsClient = new Twilio.Conversations.Client(accessManager);
            conversationsClient.listen().then(function() {
                $log.log('Connected to Twi. Listening for incoming Invites as "'+conversationsClient.identity +'"');

                conversationsClient.on('invite', function(invite) {
                    $log.log('Incoming invite from: '+invite.from);
                    invite.accept();
                });
            }).catch(function(error) {
                $log.log('Could not connect to Twilio: ' + error.message);
            });
        });

        function conversationStarted(conversation) {

        }

        vm.conversationStarted = function(conversation) {
            activeConversation = conversation;
            if (!vm.previewMedia) {
                $scope.$apply(function() {
                    vm.previewMedia = conversation.localMedia;
                });
            }
            conversation.on('participantConnected', function(participant) {
                $scope.$apply(function() {
                    $log.log('Participant "' + participant.identity + '" connected');
                    vm.remoteParticipants[participant.sid] = participant.media;
                });
            });
        }
        invite.accept().then(conversationStarted);

        vm.previewMedia = new Twilio.Conversations.LocalMedia();
        Twilio.Conversations.getLocalMedia().then(function(mediaStream) {
            $scope.$apply(function() {
                vm.previewMedia.addStream(mediaStream);
            });
        }).catch(function(error) {
            $log.error('Unable to access local media', error);
        });
        vm.previewMedia;


        //My own stuff

        $scope.submitVideo = function (video) {
          console.log('inside submitVideo controller 2');
          $http
          .post('/video/new', $scope.video)
          .success(function (data, status, headers, config) {
            console.log('in controller data::::::',data);
            // $window.localStorage.token = data.token;
            // // console.log('in controller $window.localStorage.token::::::',$window.localStorage.token);
            //
            // $scope.message = 'Welcome';
            // $window.location.href = '/assets/views/users.html';
          })
          .error(function (data, status, headers, config) {
            // Erase the token if the user fails to log in
            // delete $window.localStorage.token;

            // Handle login errors here
            $scope.message = 'Error: Invalid user or password';
          });
        };

    };





})();
