'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    sanitizeHtml = require('sanitize-html'),
    Offer = mongoose.model('Offer'),
    _ = require('lodash');

/**
 * Rules for sanitizing offers coming in and out
 * @link https://github.com/punkave/sanitize-html
 */
var offerSanitizeOptions = {
    allowedTags: [ 'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'li', 'ul', 'ol', 'blockquote', 'code', 'pre' ],
    allowedAttributes: {
      'a': [ 'href' ],
      // We don't currently allow img itself, but this would make sense if we did:
      //'img': [ 'src' ]
    },
    selfClosing: [ 'img', 'br' ],
    // URL schemes we permit
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ]
  };


/**
 * Create a Offer
 */
exports.create = function(req, res) {
  console.log('->offer.create');

  var offer = new Offer(req.body);
  offer.user = req.user;

  // Sanitize offer contents
  offer.description = sanitizeHtml(offer.description, offerSanitizeOptions);
  offer.noOfferDescription = sanitizeHtml(offer.noOfferDescription, offerSanitizeOptions);

  // Convert the Model instance to a simple object using Model's 'toObject' function
  // to prevent weirdness like infinite looping...
  var upsertData = offer.toObject();

  // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
  delete upsertData._id;

  // Do the upsert, which works like this: If no Offer document exists with
  // _id = offer.id, then create a new doc using upsertData.
  // Otherwise, update the existing doc with upsertData
  // @link http://stackoverflow.com/a/7855281
  Offer.update({
    user: upsertData.user,
  },
  upsertData,
  { upsert: true },
  function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(upsertData);
    }
  });

};


/**
 * Update a Offer
 */
exports.update = function(req, res) {
  console.log('->offer.read');

};

/**
 * Delete an Offer
 */
exports.delete = function(req, res) {
  console.log('->offer.delete');

};

/**
 * List of Offers
 */
exports.list = function(req, res) {
  console.log('->offer.list');
};

/**
 * Show the current Offer
 */
exports.read = function(req, res) {
  console.log('->offer.read');
  res.jsonp(req.offer);
};


// Offer reading middleware
exports.offerByUserID = function(req, res, next, userId) {
  console.log('->offer.offerByUserID: ' + userId);

  Offer.findOne({
      user: userId
    })
    .exec(function(err, offer) {
      if (err) return next(err);
      //if (!offer) return next(new Error('Failed to load offers.'));

      if (offer) {
        // Sanitize each outgoing offer's contents
        offer.description = sanitizeHtml(offer.description, offerSanitizeOptions);
        offer.noOfferDescription = sanitizeHtml(offer.noOfferDescription, offerSanitizeOptions);
        req.offer = offer;
      }
      else {
        // Return default offer
        req.offer = {
          status: 'no',
          user: {
            id: userId
          }
        };
      }
      next();
    });

};


/**
 * Offer authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  console.log('->offer.hasAuthorization');
  if (req.offer.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
