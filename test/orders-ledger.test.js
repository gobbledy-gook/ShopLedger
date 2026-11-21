var test = require('node:test');
var assert = require('node:assert');

var orders = require('../lib/orders');
var dates = require('../lib/dates');
var ledger = require('../lib/ledger');

function orderDb() {
  return {
    orders: [
      { id: 1, date: '15/03/2022', customer: 'March order' },
      { id: 2, date: '30/01/2022', customer: 'January order' },
      { id: 3, date: '28/12/2021', customer: 'December order' }
    ]
  };
}

function ledgerDb() {
  return {
    nextSettlementId: 501,
    settlements: [],
    customers: [{
      id: 1,
      name: 'Meera Joshi',
      openingBalance: 450,
      totalBilled: 1982.01,
      totalSettled: 1200,
      balance: 1232.01
    }]
  };
}

test('CURRENT BEHAVIOUR: orders.list sorts DD/MM/YYYY dates by newest real date', function () {
  var result = orders.list(orderDb());

  assert.deepStrictEqual(result.map(function (order) { return order.id; }), [1, 2, 3]);
});

test('CURRENT BEHAVIOUR: orders.list applies date-picker YYYY-MM-DD bounds chronologically', function () {
  var result = orders.list(orderDb(), {
    from: '2022-01-01',
    to: '2022-02-28'
  });

  assert.deepStrictEqual(result.map(function (order) { return order.id; }), [2]);
});

test('CURRENT BEHAVIOUR: dates.normalizeDateKey converts ISO dates and otherwise returns trimmed input', function () {
  assert.strictEqual(dates.normalizeDateKey('2022-03-15'), '15/03/2022');
  assert.strictEqual(dates.normalizeDateKey(' 15/03/2022 '), '15/03/2022');
  assert.strictEqual(dates.normalizeDateKey(''), '');
});

test('CURRENT BEHAVIOUR: ledger.recordSettlement updates totals correctly for numeric amounts', function () {
  var db = ledgerDb();
  var result = ledger.recordSettlement(db, 1, 500, 'upi', 'numeric payment');

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.customer.totalSettled, 1700);
  assert.strictEqual(result.customer.balance, 732.01);
  assert.strictEqual(result.settlement.id, 501);
  assert.strictEqual(result.settlement.amount, 500);
  assert.match(result.settlement.date, /^\d{2}\/\d{2}\/\d{4}$/);
});

test('CURRENT BEHAVIOUR: ledger.recordSettlement converts a string JSON amount to a number', function () {
  var db = ledgerDb();
  var result = ledger.recordSettlement(db, 1, '500', 'upi', 'string payment');

  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.customer.totalSettled, 1700);
  assert.strictEqual(result.customer.balance, 732.01);
  assert.strictEqual(result.settlement.amount, 500);
});

test('CURRENT BEHAVIOUR: ledger.recordSettlement rejects zero and negative amounts without mutation', function () {
  var db = ledgerDb();
  var zeroResult = ledger.recordSettlement(db, 1, 0, 'upi', 'zero');
  var negativeResult = ledger.recordSettlement(db, 1, -500, 'upi', 'negative');

  assert.deepStrictEqual(zeroResult, { ok: false, error: 'Settlement amount must be greater than zero' });
  assert.deepStrictEqual(negativeResult, { ok: false, error: 'Settlement amount must be greater than zero' });
  assert.strictEqual(db.customers[0].totalSettled, 1200);
  assert.strictEqual(db.customers[0].balance, 1232.01);
  assert.strictEqual(db.settlements.length, 0);
});

test('CURRENT BEHAVIOUR: ledger.recordSettlement rejects a non-numeric string without mutation', function () {
  var db = ledgerDb();
  var result = ledger.recordSettlement(db, 1, 'not-a-number', 'upi', 'invalid string');

  assert.deepStrictEqual(result, { ok: false, error: 'Settlement amount must be greater than zero' });
  assert.strictEqual(db.customers[0].totalSettled, 1200);
  assert.strictEqual(db.customers[0].balance, 1232.01);
  assert.strictEqual(db.settlements.length, 0);
});

test('orders list by real date and JSON settlement amounts update balances numerically', function () {
  var sorted = orders.list(orderDb());
  var filtered = orders.list(orderDb(), {
    from: '2022-01-01',
    to: '2022-02-28'
  });
  var db = ledgerDb();
  var settlement = ledger.recordSettlement(db, 1, '500', 'upi', 'string payment');

  assert.deepStrictEqual(sorted.map(function (order) { return order.id; }), [1, 2, 3]);
  assert.deepStrictEqual(filtered.map(function (order) { return order.id; }), [2]);
  assert.strictEqual(settlement.ok, true);
  assert.strictEqual(settlement.customer.totalSettled, 1700);
  assert.strictEqual(settlement.customer.balance, 732.01);
  assert.strictEqual(settlement.settlement.amount, 500);
});
