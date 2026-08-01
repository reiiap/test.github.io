import assert from 'node:assert/strict';
import test from 'node:test';
import { applyLedgerBalance, assertNoNegativeBalance, signedAmount } from '../lib/wallet/core.ts';

test('purchase credit simulation adds Coin', () => {
  assert.equal(applyLedgerBalance([{ amount: 50, status: 'COMPLETED' }]), 50);
});

test('conversion debit subtracts Coin', () => {
  assert.equal(applyLedgerBalance([{ amount: 150, status: 'COMPLETED' }, { amount: -2, status: 'COMPLETED' }]), 148);
});

test('failed conversion refund restores Coin with compensating entry', () => {
  assert.equal(applyLedgerBalance([{ amount: 10, status: 'COMPLETED' }, { amount: -1, status: 'COMPLETED' }, { amount: 1, status: 'COMPLETED' }]), 10);
});

test('duplicate request with cancelled or failed ledger entries does not change completed balance', () => {
  assert.equal(applyLedgerBalance([{ amount: 50, status: 'COMPLETED' }, { amount: 50, status: 'FAILED' }, { amount: -1, status: 'CANCELLED' }]), 50);
});

test('insufficient balance is rejected', () => {
  assert.throws(() => assertNoNegativeBalance(0, 1), /Saldo Coin tidak cukup/);
});

test('admin adjustment uses signed credit and debit amounts', () => {
  assert.equal(signedAmount('credit', 25), 25);
  assert.equal(signedAmount('debit', 25), -25);
});

test('ledger integrity rejects zero amount', () => {
  assert.throws(() => signedAmount('credit', 0), /positif/);
});
