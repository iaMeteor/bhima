var q = require('q');

module.exports = function(db, parser, journal, uuid) {
  'use strict';

  function execute(data, userId, callback) {
    return writeToJournal(data.paiement_uuid, userId, data)
    .then(function(){ 
      var res = {};
      res.docId = data.paiement_uuid;    
      callback(null, res);
    })
    .catch(function (err) {
      callback(err, null);
    });    
  }

  function writeToJournal (id, userId, data) {
    var deferred = q.defer();
    journal.request('promesse_payment', id, userId, function (error, result) {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(result);
    }, undefined, data);
    return deferred.promise;
  }
  return { execute : execute };
};