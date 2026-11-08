import { PolicyVariables, RefundCalculationInput, RefundCalculationResult } from '../types';

export function calculateRefund(
  input: RefundCalculationInput,
  variables: PolicyVariables
): RefundCalculationResult {
  const advance = Math.max(0, Number(input.advance) || 0);
  const standardRate = Math.max(0, Number(input.standardRate) || 0);
  const unitsCompleted = Math.max(0, Number(input.unitsCompleted) || 0);
  const unitsStarted = Math.max(0, Number(input.unitsStarted) || 0);
  const totalUnitsCounted = unitsCompleted + unitsStarted;

  const advanceDate = new Date(input.advanceDate);
  const cancellationDate = new Date(input.cancellationDate);

  // Calculate days elapsed in calendar days
  const diffTime = cancellationDate.getTime() - advanceDate.getTime();
  const daysElapsed = isNaN(diffTime) ? 0 : Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const refundWindowDays = variables.refund_window_days || 7;
  const retentionPercent = variables.refund_retention_percent || 50;

  const isWithinWindow = daysElapsed <= refundWindowDays;
  const stepByStep: string[] = [];

  stepByStep.push(`Advance received: ₹${advance.toLocaleString('en-IN')}`);
  stepByStep.push(
    `Dates: Advance paid on ${input.advanceDate || 'N/A'}, cancellation requested on ${
      input.cancellationDate || 'N/A'
    } (${daysElapsed} day${daysElapsed === 1 ? '' : 's'} elapsed).`
  );

  let retainedPercent = 0;
  let retainedAmount = 0;
  let workDoneAmount = totalUnitsCounted * standardRate;
  let totalDeductions = 0;
  let refundAmount = 0;
  let extraPayable = 0;
  let isNeedsOwnerConfirmation = false;
  let statusNote = '';

  stepByStep.push(
    `Deliverables accounted: ${unitsCompleted} completed + ${unitsStarted} in-progress = ${totalUnitsCounted} unit(s) at ₹${standardRate.toLocaleString(
      'en-IN'
    )}/unit = ₹${workDoneAmount.toLocaleString('en-IN')}`
  );

  if (isWithinWindow) {
    retainedPercent = retentionPercent;
    retainedAmount = Math.round(advance * (retainedPercent / 100));
    totalDeductions = retainedAmount + workDoneAmount;

    stepByStep.push(
      `Request is WITHIN the ${refundWindowDays}-day window (${daysElapsed} <= ${refundWindowDays} days).`
    );
    stepByStep.push(
      `Retained advance share (${retainedPercent}% of ₹${advance.toLocaleString(
        'en-IN'
      )}): ₹${retainedAmount.toLocaleString('en-IN')}`
    );
    stepByStep.push(
      `Total deductions (retained advance + deliverables work done): ₹${retainedAmount.toLocaleString(
        'en-IN'
      )} + ₹${workDoneAmount.toLocaleString('en-IN')} = ₹${totalDeductions.toLocaleString('en-IN')}`
    );

    if (totalDeductions >= advance) {
      refundAmount = 0;
      extraPayable = totalDeductions - advance;
      statusNote = `Deductions exceed advance received. No refund is payable. Client owes an additional ₹${extraPayable.toLocaleString(
        'en-IN'
      )} for work performed beyond the advance.`;
      stepByStep.push(
        `Deductions exceed advance (₹${totalDeductions.toLocaleString(
          'en-IN'
        )} >= ₹${advance.toLocaleString('en-IN')}). Refund: ₹0. Additional balance due from client: ₹${extraPayable.toLocaleString(
          'en-IN'
        )}.`
      );
    } else {
      refundAmount = advance - totalDeductions;
      extraPayable = 0;
      statusNote = `Within ${refundWindowDays}-day refund window. Refund of ₹${refundAmount.toLocaleString(
        'en-IN'
      )} is payable to client within ${variables.refund_processing_days || 15} working days.`;
      stepByStep.push(
        `Refund payable to client = Advance (₹${advance.toLocaleString(
          'en-IN'
        )}) - Total deductions (₹${totalDeductions.toLocaleString('en-IN')}) = ₹${refundAmount.toLocaleString(
          'en-IN'
        )}.`
      );
    }
  } else {
    retainedPercent = 100;
    retainedAmount = advance;
    isNeedsOwnerConfirmation = true;

    stepByStep.push(
      `Request is OUTSIDE the ${refundWindowDays}-day window (${daysElapsed} > ${refundWindowDays} days).`
    );
    stepByStep.push(
      `As per Clause 12.2, advance payment (₹${advance.toLocaleString(
        'en-IN'
      )}) is 100% non-refundable after ${refundWindowDays} days.`
    );

    refundAmount = 0;
    if (workDoneAmount > advance) {
      extraPayable = workDoneAmount - advance;
      totalDeductions = advance + extraPayable;
      statusNote = `Cancellation outside ${refundWindowDays}-day refund window: advance is non-refundable. Extra payable for completed work: ₹${extraPayable.toLocaleString(
        'en-IN'
      )}. Needs owner confirmation.`;
      stepByStep.push(
        `Deliverables work (₹${workDoneAmount.toLocaleString(
          'en-IN'
        )}) exceeds advance (₹${advance.toLocaleString('en-IN')}). Extra balance due from client: ₹${extraPayable.toLocaleString(
          'en-IN'
        )}.`
      );
    } else {
      extraPayable = 0;
      totalDeductions = advance;
      statusNote = `Cancellation outside ${refundWindowDays}-day refund window: advance is strictly non-refundable. Refund: ₹0. Needs owner confirmation.`;
      stepByStep.push(
        `Advance is fully retained. No refund payable (₹0). No extra balance due.`
      );
    }
  }

  return {
    advance,
    daysElapsed,
    isWithinWindow,
    retainedPercent,
    retainedAmount,
    totalUnitsCounted,
    workDoneAmount,
    totalDeductions,
    refundAmount,
    extraPayable,
    statusNote,
    isNeedsOwnerConfirmation,
    stepByStep,
  };
}

