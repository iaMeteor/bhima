// Export the same configuration object for use throughout modules
var config = {
  "static": "client/dest/",
  "rootFile" : "/index.html",
  "port" : 8080,
  "db" : {
    "host"     : "localhost",
    "user"     : "bhima",
    "password" : "HISCongo2013",
    "database" : "bhima"
  },
  "log" : {
    "type" : "html",
    "file" : "log"
  },
  "session" : {
    "secret" : "xopen blowfish"
  },
  "tls" : {
    "key" : "server/config/keys/key.pem",
    "cert" : "server/config/keys/ssl.crt"
  },
  "auth" : {
    "paths" : [
      "/js",
      "/partials/receipts",
      "/assets",
      "/data",
      "/print",
      "/report",
      "/currentProject",
      "/trialbalance",
      "/reports",
      "/tree",
      "/credit_note",
      "/finance",
      "/settings",
      "/journal",
      "/editsession",
      "/visit",
      "/location",
      "/province",
      "/sector",
      "/village",
      "/images",
      "/project",
      "/error",
      "/max",
      "/inventory",
      "/account_balance",
      "/ledger",
      "/exchange",
      "/sale",
      "/purchase",
      "/user_session",
      "/some",
      "/fiscal",
      "/caution/",
      "/synthetic/",
      "/InExAccounts/",
      "/period",
      "/max_trans/",
      "/max_log/",
      "/pcash_transfert_summers",
      "/lot/",
      "/availableAccounts/",
      "/costCenterAccount/",
      "/removeFromCostCenter/",
      "/cost/",
      "/profit/",
      "/receipts",
      "/favicon.ico",
      "/expiring/",
      "/expiring_complete/",
      "/serv_dist_stock/",
      "/inv_in_depot/",
      "/availableAccounts_profit/",
      "/profitCenterAccount/",
      "/removeFromProfitCenter/",
      "/services/",
      "/available_cost_center/",
      "/available_profit_center/",
      "/service_dist/",
      "/consumption_loss/",
      "/getAccount6/",
      "/employee_list/",
      "/period_paiement/",
      "/available_payment_period/",
      "/getCheckHollyday/",
      "/getCheckOffday/",
      "/journal_list/",
      "/taxe_ipr_currency/",
      "/getConsuptionDrugs/",
      "/getItemInConsumption/",
      "/hollyday_list",
      "/getNombreMoisStockControl/",
      "/getDelaiLivraison/",
      "/monthlyConsumptions/",
      "/getCommandes/",
      "/getMonthsBeforeExpiration/",
      "/getTop10Consumption/",
      "/getPurchaseOrders/",
      "/getTop10Donor/",
      "/getExpiredTimes/",
      "/getConsumptionTrackingNumber/",
      "/getStockEntry/",
      "/getStockConsumption/",
      "/getReportPayroll/",
      "/getDataPaiement/",
      "/getDataRubrics/",
      "/getDataTaxes/",
      "/getAccount7/",
      "/posting_donation/",
      "/getEmployeePayment/",
      "/setTaxPayment/",
      "/payTax/",
      "/getDistinctInventories/",
      "/partials/",
      "/getEnterprisePayment/",
      "/getPeriodeFiscalYear/",
      "/getExploitationAccount/",
      "/cost_periodic/",
      "/profit_periodic/",
      "/posting_promesse_payment/",
      "/getEmployeeCotisationPayment/",
      "/payCotisation/",
      "/setCotisationPayment/",
      "/getSubsidies/"
    ]
  }
};

module.exports = config;