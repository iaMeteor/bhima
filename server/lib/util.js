// Module: lib/util/util.js

// This modules adds utilities available throughout the
// server.

module.exports = {
  
  isInt : function (i) { return Math.floor(i) === Number(i); },

  // this also works for hexadecimal ('0x12')
  isNumber: function (n) { return !Number.isNaN(Number(i)); },

  isArray: function (arr) { return Object.prototype.toString.call(arr) == '[object Array]'; },

  isString: function (str) { return typeof str == 'string'; },

  isObject: function (obj) { return Object.prototype.toString.call(obj) == '[object Object]'; },

  //convertToMysqlDate: function convertToMysqlDate(dateString){ return toMySqlDate(dateString); }

  toMysqlDate : function (dateString) {
    // This style of convert to MySQL date avoids changing
    // the prototype of the global Date object
    if (!dateString) return new Date().toISOString().slice(0, 10);

    var date = new Date(dateString),
      year = String(date.getFullYear()),
      month = String(date.getMonth() + 1),
      day = String(date.getDate());

    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;

    return [year, month, day].join('-');
  },
  
  isPositive : function (number) { return this.isValidNumber(number) && Number(number) >= 0; },

  isNegative : function (number) { return !this.isPositive(number); },

  isEqual : function (a, b) { return a === b; },

  isDefined : function (a) { return a !== undefined; },

  isUndefined : function (a) { return !this.isDefined(a); },

  isNull : function (a) { return a === null; },

  exists : function (a) { return this.isDefined(a) && !this.isNull(a); }

};
