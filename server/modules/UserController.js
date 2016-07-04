var User = require("../models/user");
var geocoder = require('geocoder');
var mongoose = require("mongoose");



UserController = function() {}; //https://github.com/danialfarid/ng-file-upload/wiki/Node-example

UserController.prototype.uploadFile = function(req, res) {
    // We are able to access req.files.file thanks to
    // the multiparty middleware
    var file = req.files.file;
    console.log('file.name',file.name);
    console.log('file.type', file.type);
    console.log('file', file);

    console.log('saveUserIdentityDocument, req.body::::',req.body);

    var reqbody = req.body;
    var Connected_stripe_ID = req.user.epirts.id;
    console.log('req.user::::',req.user);
    console.log('req.user.epirts.id::::',req.user.epirts.id);
    console.log('Connected_stripe_ID::::',Connected_stripe_ID);

    const fs = require('fs');
    var fp = fs.readFileSync(file.path);
    var stripe = require('stripe')('sk_test_SfT5Rf2DMVfT0unJf7aIIskQ'); // 'sk_test_SfT5Rf2DMVfT0unJf7aIIskQ', 'pk_test_C6pNjUH41hCQ87RXmeLBIAa5', PLATFORM_SECRET_KEY
    stripe.fileUploads.create(
      {
        purpose: 'identity_document',
        file: {
          data: fp, //fs.readFileSync('/path/to/a/file.jpg'),
          name: 'drivers_license.jpg',
          type: 'application/octet-stream'
        }
      },
      {stripe_account: Connected_stripe_ID}
    ).then(function (response) {
        console.log(' stripe identity_document response:::: ', response);
        // console.log('token created for card ending in ', response.card.last4);

      stripe.accounts.retrieve(
        Connected_stripe_ID,
        function(err, account) {
          // asynchronously called
          User.findOneAndUpdate({ _id: req.user._id }, { epirts: {id: req.user.epirts.id, keys: req.user.epirts.keys, response: req.user.epirts.keys, account: account} }, function(err, user) {
            if (err) throw err;
            // we have the updated user returned to us
            console.log('after saving user"s stripe info oooo',user);
          });
        }
      );

      });
      res.json({file_name: file.name, file_type: file.type});
}

module.exports = new UserController();
