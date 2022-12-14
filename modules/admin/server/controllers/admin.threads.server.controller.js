/**
 * Module dependencies.
 */
const _ = require('lodash');
const errorService = require('../../../core/server/services/error.server.service');
const mongoose = require('mongoose');
const Thread = mongoose.model('Thread');

/*
 * This middleware sends response with an array of found users
 */
exports.getThreads = async (req, res) => {
  // See `usernameToUserId` middleware from admin.users.server.controller.js
  // req.userId can get placed in request when `req.body.username` is set.
  const userId = req.userIdFromUsername || _.get(req, ['body', 'userId']);

  // Check that provided ID is valid
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({
      message: errorService.getErrorMessageByKey('invalid-id'),
    });
  }

  Thread.aggregate([
    {
      // Latest message in thread is either from, or to user
      $match: {
        $or: [
          // eslint-disable-next-line new-cap
          { userFrom: mongoose.Types.ObjectId(userId) },
          // eslint-disable-next-line new-cap
          { userTo: mongoose.Types.ObjectId(userId) },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userTo',
        foreignField: '_id',
        as: 'userToProfile',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userFrom',
        foreignField: '_id',
        as: 'userFromProfile',
      },
    },
    {
      $project: {
        _id: 1,
        read: 1,
        updated: 1,
        'userToProfile._id': 1,
        'userToProfile.username': 1,
        'userToProfile.email': 1,
        'userFromProfile._id': 1,
        'userFromProfile.username': 1,
      },
    },
    {
      $sort: { updated: -1 },
    },
  ]).exec((err, threads) => {
    if (err) {
      return res.status(400).send({
        message: errorService.getErrorMessage(err),
      });
    }

    return res.send(threads);
  });
};
