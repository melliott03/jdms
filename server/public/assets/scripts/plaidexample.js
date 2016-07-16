myApp.config([
        'plaidLinkProvider',

        function(plaidLinkProvider) {
            plaidLinkProvider.init({
                selectAccount: true,
                clientName: 'NowLanguage',
                env: 'tartan',
                key: '09b483e7f2a23fc9ebc47dd904323f',
                product: 'auth'
            });
        }
    ])

    .controller('contPlaidCtrl', [
        '$scope',
        'plaidLink',
        'PlaidService',

        function($scope, plaidLink, PlaidService) {
            var plaidService = PlaidService;
            $scope.token = '';
            $scope.plaidIsLoaded = plaidLink.isLoaded;

            plaidLink.create({
                onSuccess: function(token, metadata) {
                    $scope.token = token;
                    console.log('metadata', metadata);
                    console.log('token', token);
                    var plaidSuccessObject = {};
                        plaidSuccessObject.public_token = token;
                        plaidSuccessObject.account_id = metadata.account_id;
                        plaidService.sendContToken(plaidSuccessObject);

                },
                onExit: function() {
                    console.log('user closed');
                }
            });

            $scope.openPlaid = function() {
                plaidLink.open();
            };
        }
    ]).controller('custPlaidCtrl', [
        '$scope',
        'plaidLink',
        'PlaidService',

        function($scope, plaidLink, PlaidService) {
            var plaidService = PlaidService;
            $scope.token = '';
            $scope.plaidIsLoaded = plaidLink.isLoaded;

            plaidLink.create({
                onSuccess: function(token, metadata) {
                    $scope.token = token;
                    console.log('metadata', metadata);
                    console.log('token', token);
                    var plaidSuccessObject = {};
                        plaidSuccessObject.public_token = token;
                        plaidSuccessObject.account_id = metadata.account_id;
                        plaidService.sendCustToken(plaidSuccessObject);

                },
                onExit: function() {
                    console.log('user closed');
                }
            });

            $scope.openPlaid = function() {
                plaidLink.open();
            };
        }
    ]);
