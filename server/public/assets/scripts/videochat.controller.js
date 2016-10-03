(function () {
    'use strict';
   
    angular
        .module('myApp.videochat', [])
        .controller('VideoChatController', VideoChatController);
   
    VideoChatController.$inject = ['$scope', '$log'];
   
    function VideoChatController($scope, $log) {
        var vm = this;

        vm.previewCamera = function () {
          console.log('inside vm.previewCamera::');

               vm.previewMedia = new Twilio.Conversations.LocalMedia();
               Twilio.Conversations.getLocalMedia().then(function (mediaStream) {

                   $scope.$apply(function () {
                       vm.previewMedia.addStream(mediaStream);
                   });

               }).catch(function (error) {
                   $log.error('Unable to access local media', error);
               });
           };

           vm.previewMedia;
    }
})();
