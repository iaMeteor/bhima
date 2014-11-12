var q =  require('q');
var db = require('./../lib/db');
var sanitize = require('./../lib/sanitize');

// FIXME
//    (1) There are lots of micro-routes.  If possible, we should
//      condense these into a clean API
//    (2) Ensure the code abides by the project synatx and style
//      guidelines.
//    (3) 'use strict'

/*
 * HTTP Controllers
*/
exports.compileDebtorLedger = function (req, res, next) { 
  debitor(req.params.id)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

exports.compileGroupLedger = function (req, res, next) { 
  debitorGroup(req.params.id)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

exports.compileSaleLedger = function (req, res, next) { 
  distributableSale(req.params.id)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

/*
 * Utility Methods
*/
function debitor(id) {
  var defer = q.defer();

  // debtor query
  if (!id) { defer.reject(new Error('No debtor id selected!')); }
  else { id = sanitize.escape(id); }

  var query =
    'SELECT `account_id` ' +
    'FROM `debitor` JOIN `debitor_group` ON ' +
      '`debitor`.`group_uuid` = `debitor_group`.`uuid` ' +
    'WHERE `debitor`.`uuid`=' + id +';';

  db.exec(query)
  .then(function (ans) {

    var account = ans.pop().account_id;

    var query =
      'SELECT c.inv_po_id, c.trans_id, c.trans_date, c.account_id FROM (' +
        'SELECT p.inv_po_id, p.trans_id, p.trans_date, p.account_id ' +
        'FROM posting_journal AS p ' +
        'WHERE p.deb_cred_uuid = ' + id + ' AND p.account_id = ' + account + ' ' +
      'UNION ' +
        'SELECT g.inv_po_id, g.trans_date, g.trans_id, g.account_id ' +
        'FROM general_ledger AS g ' +
        'WHERE g.deb_cred_uuid = ' + id + ' AND g.account_id = ' + account + ') ' +
      ' AS c;';

    return db.exec(query);
  })
  .then(function (ans) {
    if (!ans.length) { defer.resolve([]); }

    var invoices = ans.map(function (line) {
      return line.inv_po_id;
    });

    var account_id = ans.pop().account_id;

    var sql =
      'SELECT s.reference, s.project_id, `t`.`inv_po_id`, `t`.`trans_date`, SUM(`t`.`debit_equiv`) AS `debit`,  ' +
      'SUM(`t`.`credit_equiv`) AS `credit`, SUM(`t`.`debit_equiv` - `t`.`credit_equiv`) as balance, ' +
      '`t`.`account_id`, `t`.`deb_cred_uuid`, `t`.`currency_id`, `t`.`doc_num`, `t`.`description`, `t`.`account_id`, ' +
      '`t`.`comment`, `p`.`abbr`, `c`.`document_id` ' +
      ', IF(NOT(ISNULL(`c`.`document_id`)), 1, 0) as `consumed` ' +
      // TODO Check if sale exists in consumption_sale table, validate if it has been distributed
      // 'CASE(WHEN `t`.`consumption_id` THEN true ELSE false) as consumed ' +
      'FROM (' +
        '(' +
          'SELECT `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit`, ' +
            '`posting_journal`.`credit`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, ' +
            '`posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, `posting_journal`.`currency_id`, ' +
            '`posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment` ' +
          'FROM `posting_journal` ' +
        ') UNION (' +
          'SELECT `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit`, ' +
            '`general_ledger`.`credit`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, ' +
            '`general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment` ' +
          'FROM `general_ledger` ' +
        ')' +
      ') AS `t` JOIN sale AS s on t.inv_po_id = s.uuid JOIN project AS p on s.project_id = p.id LEFT JOIN consumption as c on t.inv_po_id = c.document_id ' +
      'WHERE `t`.`inv_po_id` IN ("' + invoices.join('","') + '") ' +
      'AND t.account_id = ' + account_id + ' ' +
      'GROUP BY `t`.`inv_po_id`;\n';

    return db.exec(sql);
  })
  .then(function (ans) {
    defer.resolve(ans);
  })
  .catch(function (error) {
    defer.reject(error);
  });

  return defer.promise;
}

function debitorGroup(id) {
  var defer = q.defer();

  // debtor query
  if (!id) { defer.reject(new Error('No debitor_group id selected!')); }
  else { id = sanitize.escape(id); }

  var query =
    'SELECT `account_id` ' +
    'FROM `debitor_group` WHERE `debitor_group`.`uuid`=' + id +';';

  db.exec(query)
  .then(function (ans) {

    var account = ans.pop().account_id;

    var query =
      'SELECT c.inv_po_id, c.trans_id, c.trans_date, c.account_id FROM (' +
        'SELECT p.inv_po_id, p.trans_id, p.trans_date, p.account_id ' +
        'FROM posting_journal AS p ' +
        'WHERE p.account_id = ' + account + ' ' +
      'UNION ' +
        'SELECT g.inv_po_id, g.trans_date, g.trans_id, g.account_id ' +
        'FROM general_ledger AS g ' +
        'WHERE g.account_id = ' + account + ') ' +
      ' AS c;';

    return db.exec(query);
  })
  .then(function (ans) {
    if (!ans.length) { defer.resolve([]); }

    var invoices = ans.map(function (line) {
      return line.inv_po_id;
    });

    var account_id = ans.pop().account_id;

    var sql =
      'SELECT s.reference, s.project_id, `t`.`inv_po_id`, `t`.`trans_date`, SUM(`t`.`debit_equiv`) AS `debit`,  ' +
      'SUM(`t`.`credit_equiv`) AS `credit`, SUM(`t`.`debit_equiv` - `t`.`credit_equiv`) as balance, ' +
      '`t`.`account_id`, `t`.`deb_cred_uuid`, `t`.`currency_id`, `t`.`doc_num`, `t`.`description`, `t`.`account_id`, ' +
      '`t`.`comment`' +
      'FROM (' +
        '(' +
          'SELECT `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit`, ' +
            '`posting_journal`.`credit`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, ' +
            '`posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, `posting_journal`.`currency_id`, ' +
            '`posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment` ' +
          'FROM `posting_journal` ' +
        ') UNION (' +
          'SELECT `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit`, ' +
            '`general_ledger`.`credit`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, ' +
            '`general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment` ' +
          'FROM `general_ledger` ' +
        ')' +
      ') AS `t` JOIN sale AS s on t.inv_po_id = s.uuid ' +
      'WHERE `t`.`inv_po_id` IN ("' + invoices.join('","') + '") ' +
      'AND t.account_id = ' + account_id + ' ' +
      'GROUP BY `t`.`inv_po_id`;\n';

    return db.exec(sql);
  })
  .then(function (ans) {
    defer.resolve(ans);
  })
  .catch(function (error) {
    defer.reject(error);
  });

  return defer.promise;
}

function distributableSale(id) {
  var defer = q.defer();

  // debtor query
  if (!id) { defer.reject(new Error('No debtor id selected!')); }
  else { id = sanitize.escape(id); }

  var query =
    'SELECT `account_id` ' +
    'FROM `debitor` JOIN `debitor_group` ON ' +
      '`debitor`.`group_uuid` = `debitor_group`.`uuid` ' +
    'WHERE `debitor`.`uuid`=' + id +';';

  db.exec(query)
  .then(function (ans) {

    var account = ans.pop().account_id;
    var query =
      'SELECT c.inv_po_id, c.account_id, consumption.tracking_number FROM (' +
        'SELECT p.inv_po_id, p.account_id ' +
        'FROM posting_journal AS p ' +
        'WHERE p.deb_cred_uuid = ' + id + ' AND p.account_id = ' + account + ' ' +
      'UNION ' +
        'SELECT g.inv_po_id, g.account_id ' +
        'FROM general_ledger AS g ' +
        'WHERE g.deb_cred_uuid = ' + id + ' AND g.account_id = ' + account + ') ' +
      ' AS c left join consumption on c.inv_po_id = consumption.sale_uuid';

    return db.exec(query);
  })
  .then(function (ans) {
    if (!ans.length) { defer.resolve([]); }
    ans = ans.filter(function (an){
      return !an.tracking_number;

    });

    var invoices = ans.map(function (line) {
      return line.inv_po_id;
    });

    var account_id = ans.pop().account_id;

    var sql =
      'SELECT s.reference, s.project_id, `t`.`inv_po_id`, `t`.`trans_date`, SUM(`t`.`debit_equiv`) AS `debit`,  ' +
      'SUM(`t`.`credit_equiv`) AS `credit`, SUM(`t`.`debit_equiv` - `t`.`credit_equiv`) as balance, ' +
      '`t`.`account_id`, `t`.`deb_cred_uuid`, `t`.`currency_id`, `t`.`doc_num`, `t`.`description`, `t`.`account_id`, ' +
      '`t`.`comment`' +
      'FROM (' +
        '(' +
          'SELECT `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit`, ' +
            '`posting_journal`.`credit`, `posting_journal`.`debit_equiv`, `posting_journal`.`credit_equiv`, ' +
            '`posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, `posting_journal`.`currency_id`, ' +
            '`posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment` ' +
          'FROM `posting_journal` ' +
        ') UNION (' +
          'SELECT `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit`, ' +
            '`general_ledger`.`credit`, `general_ledger`.`debit_equiv`, `general_ledger`.`credit_equiv`, ' +
            '`general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
            '`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment` ' +
          'FROM `general_ledger` ' +
        ')' +
      ') AS `t` JOIN sale AS s on t.inv_po_id = s.uuid ' +
      'WHERE `t`.`inv_po_id` IN ("' + invoices.join('","') + '") ' +
      'AND t.account_id = ' + account_id + ' ' +
      'GROUP BY `t`.`inv_po_id`;\n';

    return db.exec(sql);
  })
  .then(function (ans) {
    defer.resolve(ans);
  })
  .catch(function (error) {
    defer.reject(error);
  });

  return defer.promise;
}

exports.debitor = debitor;
exports.debitor_group = debitorGroup;
exports.distributableSale = distributableSale;
