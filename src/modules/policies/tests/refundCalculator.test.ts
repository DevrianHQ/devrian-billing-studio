import assert from 'node:assert';
import test from 'node:test';
import { calculateRefund } from '../utils/refundCalculator';
import { DEFAULT_POLICY_VARIABLES } from '../constants/defaultVariables';

test('Refund Calculator: within 7-day window with refund payable to client', () => {
  const result = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-04', // 3 days elapsed
      standardRate: 2000,
      unitsCompleted: 1,
      unitsStarted: 0,
    },
    DEFAULT_POLICY_VARIABLES
  );

  assert.strictEqual(result.daysElapsed, 3);
  assert.strictEqual(result.isWithinWindow, true);
  assert.strictEqual(result.retainedAmount, 5000); // 50% of 10000
  assert.strictEqual(result.workDoneAmount, 2000);
  assert.strictEqual(result.totalDeductions, 7000);
  assert.strictEqual(result.refundAmount, 3000);
  assert.strictEqual(result.extraPayable, 0);
  assert.strictEqual(result.isNeedsOwnerConfirmation, false);
});

test('Refund Calculator: within window where work done + retention exceeds advance', () => {
  const result = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-03', // 2 days elapsed
      standardRate: 2500,
      unitsCompleted: 2,
      unitsStarted: 1, // 3 units total = 7500
    },
    DEFAULT_POLICY_VARIABLES
  );

  assert.strictEqual(result.daysElapsed, 2);
  assert.strictEqual(result.isWithinWindow, true);
  assert.strictEqual(result.retainedAmount, 5000);
  assert.strictEqual(result.workDoneAmount, 7500);
  assert.strictEqual(result.totalDeductions, 12500);
  assert.strictEqual(result.refundAmount, 0);
  assert.strictEqual(result.extraPayable, 2500);
});

test('Refund Calculator: outside 7-day window', () => {
  const result = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-15', // 14 days elapsed
      standardRate: 2000,
      unitsCompleted: 1,
      unitsStarted: 0,
    },
    DEFAULT_POLICY_VARIABLES
  );

  assert.strictEqual(result.daysElapsed, 14);
  assert.strictEqual(result.isWithinWindow, false);
  assert.strictEqual(result.refundAmount, 0);
  assert.strictEqual(result.extraPayable, 0);
  assert.strictEqual(result.isNeedsOwnerConfirmation, true);
});

test('Refund Calculator: outside 7-day window with deliverables exceeding advance', () => {
  const result = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-12', // 11 days elapsed
      standardRate: 3000,
      unitsCompleted: 4, // 12000 work done
      unitsStarted: 0,
    },
    DEFAULT_POLICY_VARIABLES
  );

  assert.strictEqual(result.daysElapsed, 11);
  assert.strictEqual(result.isWithinWindow, false);
  assert.strictEqual(result.refundAmount, 0);
  assert.strictEqual(result.extraPayable, 2000); // 12000 - 10000
  assert.strictEqual(result.isNeedsOwnerConfirmation, true);
});

test('Refund Calculator: exact boundary on day 7 vs day 8', () => {
  const onDay7 = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-08', // exactly 7 days
      standardRate: 1000,
      unitsCompleted: 0,
      unitsStarted: 0,
    },
    DEFAULT_POLICY_VARIABLES
  );
  assert.strictEqual(onDay7.daysElapsed, 7);
  assert.strictEqual(onDay7.isWithinWindow, true);
  assert.strictEqual(onDay7.refundAmount, 5000);

  const onDay8 = calculateRefund(
    {
      advance: 10000,
      advanceDate: '2026-11-01',
      cancellationDate: '2026-11-09', // 8 days
      standardRate: 1000,
      unitsCompleted: 0,
      unitsStarted: 0,
    },
    DEFAULT_POLICY_VARIABLES
  );
  assert.strictEqual(onDay8.daysElapsed, 8);
  assert.strictEqual(onDay8.isWithinWindow, false);
  assert.strictEqual(onDay8.refundAmount, 0);
});

