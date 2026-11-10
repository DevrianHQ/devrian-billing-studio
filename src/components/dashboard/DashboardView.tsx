import React, { useMemo } from 'react';
import { BillingDocument, DocumentStatus } from '../../types';
import { formatINR } from '../../services/indianCurrency';
import { formatDisplayDate } from '../../services/dateUtils';
import { calculateDocumentFinancials, getDocumentDisplayAmount } from '../../services/financialCalculations';
import { computeQuotationFinancials } from '../../services/quotationLayoutEngine';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, isAfter } from 'date-fns';
import {
  TrendingUp,
  CreditCard,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  FileCheck,
  CheckCircle2,
  Users,
  Repeat,
} from 'lucide-react';

interface DashboardViewProps {
  documents: BillingDocument[];
  onOpenDocument: (doc: BillingDocument) => void;
  onNavigateToHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  onOpenDocument,
  onNavigateToHistory,
}) => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // Stats for current month
  const monthlyStats = useMemo(() => {
    let billedThisMonth = 0;
    let receivedThisMonth = 0;
    let pendingThisMonth = 0;
    let overdueCount = 0;

    documents.forEach((d) => {
      // Overdue count across all documents
      if (d.status === 'OVERDUE') {
        overdueCount++;
      }

      // Check if document date falls in current month
      try {
        const docDate = parseISO(d.date);
        if (isWithinInterval(docDate, { start: currentMonthStart, end: currentMonthEnd })) {
          const fin = calculateDocumentFinancials(d, documents);
          billedThisMonth += fin.billed;
          receivedThisMonth += fin.received;
          pendingThisMonth += fin.pending;
        }
      } catch {
        // Ignore date parse issues
      }
    });

    return {
      billedThisMonth,
      receivedThisMonth,
      pendingThisMonth,
      overdueCount,
    };
  }, [documents, currentMonthStart, currentMonthEnd]);

  // Quotation pipeline stats
  const quotationStats = useMemo(() => {
    let sentThisMonth = 0;
    let sentAllTime = 0;
    let acceptedThisMonth = 0;
    let acceptedAllTime = 0;
    let pipelineValue = 0;
    let monthlyRecurringQuoted = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    documents.forEach((d) => {
      if (d.type !== 'quotation') return;

      const isSent = d.status === 'SENT' || d.status === 'ACCEPTED' || d.status === 'REJECTED' || d.status === 'EXPIRED';
      const isAccepted = d.status === 'ACCEPTED';
      const docAmount = d.subtotal - (d.discountAmount || 0) + (d.totalTaxAmount || 0);

      let inMonth = false;
      try {
        const docDate = parseISO(d.date);
        inMonth = isWithinInterval(docDate, { start: currentMonthStart, end: currentMonthEnd });
      } catch {
        // ignore
      }

      if (isSent) {
        sentAllTime++;
        if (inMonth) sentThisMonth++;
      }
      if (isAccepted) {
        acceptedAllTime++;
        if (inMonth) acceptedThisMonth++;
      }

      // Pipeline value: sum of SENT, non-expired
      if (d.status === 'SENT') {
        let isExpired = false;
        if (d.validTill) {
          try {
            const vDate = parseISO(d.validTill);
            if (isAfter(today, vDate)) isExpired = true;
          } catch {
            // ignore
          }
        }
        if (!isExpired) {
          pipelineValue += docAmount;
        }
      }

      // Monthly recurring value quoted: sum of monthly fee on active SENT or ACCEPTED retainers
      if ((d.status === 'SENT' || d.status === 'ACCEPTED') && (d.quotationType === 'monthly' || d.quotationType === 'hybrid')) {
        const fin = computeQuotationFinancials(d);
        monthlyRecurringQuoted += fin.monthlyTotal;
      }
    });

    const convRateThisMonth = sentThisMonth > 0 ? Math.round((acceptedThisMonth / sentThisMonth) * 100) : 0;
    const convRateAllTime = sentAllTime > 0 ? Math.round((acceptedAllTime / sentAllTime) * 100) : 0;

    return {
      sentThisMonth,
      sentAllTime,
      acceptedThisMonth,
      acceptedAllTime,
      convRateThisMonth,
      convRateAllTime,
      pipelineValue,
      monthlyRecurringQuoted,
    };
  }, [documents, currentMonthStart, currentMonthEnd]);

  // 6-month bar chart calculation
  const sixMonthData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      const label = format(monthDate, 'MMM yy');

      let billed = 0;
      let received = 0;

      documents.forEach((d) => {
        try {
          const docDate = parseISO(d.date);
          if (isWithinInterval(docDate, { start: mStart, end: mEnd })) {
            const fin = calculateDocumentFinancials(d, documents);
            billed += fin.billed;
            received += fin.received;
          }
        } catch {
          // ignore
        }
      });

      data.push({ label, billed, received });
    }
    return data;
  }, [documents, now]);

  // Maximum value for chart scaling
  const maxChartVal = useMemo(() => {
    let max = 1000;
    sixMonthData.forEach((d) => {
      if (d.billed > max) max = d.billed;
      if (d.received > max) max = d.received;
    });
    return max * 1.15; // 15% headroom
  }, [sixMonthData]);

  // Top clients by total billed
  const topClients = useMemo(() => {
    const clientMap: { [name: string]: { billed: number; count: number } } = {};
    documents.forEach((d) => {
      const name = d.clientName?.trim() || 'Unknown';
      if (!clientMap[name]) {
        clientMap[name] = { billed: 0, count: 0 };
      }
      clientMap[name].count += 1;
      if (d.type === 'invoice') {
        clientMap[name].billed += d.subtotal - d.discountAmount + (d.totalTaxAmount || 0);
      } else if (d.type === 'receipt') {
        const isLinked = Boolean(d.sourceInvoiceId && documents.some((inv) => inv.id === d.sourceInvoiceId));
        if (!isLinked) {
          clientMap[name].billed += d.totalProjectCost || d.amountReceived || d.advanceReceived || 0;
        }
      }
    });

    return Object.entries(clientMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.billed - a.billed)
      .slice(0, 5);
  }, [documents]);

  // Recent 5 documents
  const recentDocs = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [documents]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Studio Dashboard</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Financial overview and billing performance for {format(now, 'MMMM yyyy')}.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Billed This Month */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Billed This Month</span>
            <TrendingUp size={15} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(monthlyStats.billedThisMonth)}
          </div>
          <p className="text-[10px] text-neutral-500">Invoices issued this month</p>
        </div>

        {/* 2. Received This Month */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Received This Month</span>
            <CreditCard size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {formatINR(monthlyStats.receivedThisMonth)}
          </div>
          <p className="text-[10px] text-neutral-500">Total payments collected</p>
        </div>

        {/* 3. Pending This Month */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Due</span>
            <Clock size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {formatINR(monthlyStats.pendingThisMonth)}
          </div>
          <p className="text-[10px] text-neutral-500">Balance due on this month's invoices</p>
        </div>

        {/* 4. Overdue Invoices */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue Invoices</span>
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 tracking-tight">
            {monthlyStats.overdueCount}
          </div>
          <p className="text-[10px] text-neutral-500">Requires follow-up</p>
        </div>
      </div>

      {/* Quotation Pipeline & Conversion Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            Quotation Pipeline & Performance
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Quotations Sent */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Quotations Sent</span>
              <FileCheck size={15} className="text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {quotationStats.sentThisMonth}
              <span className="text-xs font-normal text-neutral-400 ml-1.5">/ {quotationStats.sentAllTime} all</span>
            </div>
            <p className="text-[10px] text-neutral-500">Sent to prospective clients</p>
          </div>

          {/* 2. Accepted */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Accepted</span>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {quotationStats.acceptedThisMonth}
              <span className="text-xs font-normal text-neutral-400 ml-1.5">/ {quotationStats.acceptedAllTime} all</span>
            </div>
            <p className="text-[10px] text-neutral-500">Client approvals</p>
          </div>

          {/* 3. Conversion Rate */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Conversion</span>
              <TrendingUp size={15} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {quotationStats.convRateThisMonth}%
              <span className="text-xs font-normal text-neutral-400 ml-1.5">({quotationStats.convRateAllTime}% all)</span>
            </div>
            <p className="text-[10px] text-neutral-500">Accepted / sent</p>
          </div>

          {/* 4. Pipeline Value */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pipeline</span>
              <CreditCard size={15} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 tracking-tight">
              {formatINR(quotationStats.pipelineValue)}
            </div>
            <p className="text-[10px] text-neutral-500">Active non-expired quotes</p>
          </div>

          {/* 5. Monthly Recurring Quoted */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Recurring</span>
              <Repeat size={15} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 tracking-tight">
              {formatINR(quotationStats.monthlyRecurringQuoted)}
              <span className="text-xs font-normal text-neutral-400 ml-1">/mo</span>
            </div>
            <p className="text-[10px] text-neutral-500">Active retainer value quoted</p>
          </div>
        </div>
      </div>

      {/* Grid: 6-Month Bar Chart (7 cols) & Top Clients (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Month Chart */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                6-Month Revenue Trend
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Billed vs. Payments Received</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white inline-block" />
                <span className="text-neutral-300">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-600 inline-block" />
                <span className="text-neutral-400">Received</span>
              </div>
            </div>
          </div>

          {/* Clean minimalist Bar Chart */}
          <div className="h-56 pt-6 flex items-end justify-between gap-3 border-b border-neutral-800 pb-2">
            {sixMonthData.map((item, idx) => {
              const billedPct = Math.round((item.billed / maxChartVal) * 100);
              const receivedPct = Math.round((item.received / maxChartVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Billed Bar */}
                    <div
                      className="w-4 sm:w-5 bg-white rounded-t transition-all duration-300 hover:brightness-125 relative group"
                      style={{ height: `${Math.max(4, billedPct)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                        {formatINR(item.billed)}
                      </div>
                    </div>

                    {/* Received Bar */}
                    <div
                      className="w-4 sm:w-5 bg-neutral-600 rounded-t transition-all duration-300 hover:brightness-125 relative group"
                      style={{ height: `${Math.max(4, receivedPct)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                        {formatINR(item.received)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Clients</h2>
            <Users size={14} className="text-neutral-500" />
          </div>

          <div className="divide-y divide-neutral-800/60">
            {topClients.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No client records yet.</p>
            ) : (
              topClients.map((client, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-neutral-500 font-bold text-xs">#{idx + 1}</span>
                    <div>
                      <div className="font-semibold text-xs text-white">{client.name}</div>
                      <div className="text-[10px] text-neutral-400">
                        {client.count} document{client.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-xs text-white">{formatINR(client.billed)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Billing Activity
          </h2>
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium"
          >
            View All History <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {recentDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="p-3.5 flex items-center justify-between hover:bg-neutral-800/30 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-white">{doc.documentNumber}</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                  {doc.type}
                </span>
                <span className="text-xs text-neutral-300">{doc.clientName}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-400">{formatDisplayDate(doc.date)}</span>
                <span className="text-xs font-bold text-white">
                  {formatINR(getDocumentDisplayAmount(doc))}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    doc.status === 'PAID'
                      ? 'border-emerald-600 text-emerald-400'
                      : doc.status === 'OVERDUE'
                      ? 'border-red-600 text-red-400'
                      : 'border-neutral-700 text-neutral-300'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

