// Module: scripts/tree.js

var q = require('q');
var db = require('./../lib/db');
var parser = require('./../lib/parser');

// FIXME
//  (1) This module should use db.exec(), with parameter
//      passing and escaping taken care of by mysql.
//  (2) Formal documentation of how this process works
//      would be welcome in the future.
//  (3) We need a uniform structure among server controllers.
//      Is exports.exposedFn an anti-pattern?  Or are we going
//      to work with it?  Do some research, pick one, and use
//      it throughout the appplication

/*
 * HTTP Controllers
*/
exports.generate = function (req, res, next) { 
  /* jshint unused : false*/

  load(req.session.user_id)
  .then(function (treeData) {
    res.send(treeData);
  })
  .catch(function (err) {
    res.send(301, err);
  })
  .done();
};

function load (userid) {

  function getChildren (parent_id) {
    var d = q.defer();
    var sql = parser.select({
      tables : {
        'permission' : { columns : ['id', 'user_id'] },
        'unit' : { columns: ['name', 'description', 'parent', 'has_children', 'url', 'path', 'key']}
      },
      join : ['permission.unit_id=unit.id'],
      where : ['permission.user_id='+userid, 'AND', 'unit.parent='+parent_id]
    });

    db.execute(sql, function (err, result) {
      if (err) { throw err; }
      var have_children = result.filter(function (row) {
        return row.has_children;
      });
      if (have_children.length) {
        var promises = have_children.map(function (row) {
          return getChildren(row.unit_id);
        });
        d.resolve(q.all(promises));
      } else {
        d.resolve(result);
      }
    });

    return d.promise;
  }

  function main () {
    var d = q.defer();
    var query = parser.select({
      tables : {
        'permission' : { columns : ['id', 'unit_id']},
        'unit': { columns : ['name', 'description', 'parent', 'has_children', 'url', 'path', 'key']}
      },
      join : ['permission.unit_id=unit.id'],
      where : ['permission.user_id=' + userid, 'AND', 'unit.parent=0'] // This assumes root is always "0"
    });

    // this is freakin' complex. DO NOT TOUCH.
    db.execute(query, function (err, result) {
      if (err) { throw err; }
      d.resolve(q.all(result.map(function (row) {
        var p = q.defer();
        if (row.has_children) {
          getChildren(row.unit_id)
          .then(function (children) {
            row.children = children;
            p.resolve(row);
          });
        }
        else { p.resolve(row); }
        return p.promise;
      })));
    });

    return d.promise;
  }

  return main();
}

exports.load = load;
