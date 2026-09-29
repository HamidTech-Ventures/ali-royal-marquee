// import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';

export const Reports = () => {
  return (
    <div className="w-full px-8 py-8">
      <div className="flex flex-col w-full space-y-8">
        
        <PageHeader 
          title="Executive Performance & Analytics Dossier"
          category="Executive Intelligence & Fiscal Performance"
          icon="analytics"
          description="Consolidated managerial intelligence spanning marquee bookings, culinary provisioning, utility disbursements, staff rosters, and event net contribution across Islamabad and Rawalpindi banquet halls."
          actions={
            <>
              <Button variant="outline" icon="sim_card_download">Export (PDF / Excel)</Button>
              <Button variant="primary" icon="post_add">Generate Custom Report</Button>
            </>
          }
        />

        {/* Global Comprehensive Filter Toolbar */}
        <section className="bg-surface-container-lowest rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
              <span className="font-title-sm text-title-sm text-primary uppercase tracking-wide">Multi-Dimensional Ledger Filters</span>
            </div>
            {/* Quick Period Selector Switcher */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-lg gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button className="px-3 py-1 text-on-surface font-title-sm text-title-sm rounded bg-surface-container-lowest shadow-sm font-semibold text-primary" type="button">Current Month vs Last</button>
              <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Quarter-to-Date</button>
              <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Year-to-Date (FY 2026)</button>
              <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Custom Range</button>
            </div>
          </div>
          
          {/* Filter Dropdown Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 pt-1">
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Venue / Hall</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">All Halls & Lawns</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Event Type</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">All Galas & Barat</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Booking Status</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">Confirmed & Active</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Payment Status</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">Settled & Overdue</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Customer Tier</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">All Tiers (VIP / Regal)</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
            
            <div className="flex flex-col bg-surface-container-low/70 hover:bg-surface-container-low px-3 py-2 rounded transition-colors cursor-pointer">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Event Manager</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-title-sm text-title-sm text-on-surface truncate">All Supervisors</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Executive Summary (6 High-Fidelity KPI Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Total Revenue</span>
                <div className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">PKR 8,425,000</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-surface-container-low/40 px-3 py-3 rounded-b-xl w-full">
              <div className="flex items-center gap-1.5 text-secondary font-semibold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+14.6% vs Aug 2026</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">From 42 finalized gala contracts</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Total Expenses</span>
                <div className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">PKR 2,385,000</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-surface-container-low/40 px-3 py-3 rounded-b-xl w-full">
              <div className="flex items-center gap-1.5 text-on-surface-variant font-semibold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+8.2% vs Aug 2026</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Procurement, diesel & crew payroll</span>
            </div>
          </div>
          
          <div className="bg-primary text-on-primary p-5 rounded-lg shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all xl:col-span-1">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/15 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  <span className="material-symbols-outlined text-[12px]">verified</span> Prime Benchmark
                </div>
                <div className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed font-semibold pt-1">Net Operating Profit</div>
                <div className="font-headline-sm text-headline-sm text-surface-container-lowest tracking-tight font-bold">PKR 6,040,000</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary-fixed/20 flex items-center justify-center text-secondary-fixed shadow-inner">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-primary-container -mx-5 -mb-5 px-5 py-3 relative z-10">
              <div className="flex items-center gap-1.5 text-secondary-fixed font-bold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                <span>+17.4% MoM Growth</span>
              </div>
              <span className="font-body-sm text-body-sm text-tertiary-fixed-dim">Gross operating surplus achieved</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Net Profit Margin</span>
                <div className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">71.7%</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">pie_chart</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-surface-container-low/40 px-3 py-3 rounded-b-xl w-full">
              <div className="flex items-center gap-1.5 text-secondary font-semibold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>+2.1% net expansion</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Target: {'>'}68.0% benchmark floor</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Total Bookings</span>
                <div className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">42 Banquets</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-surface-container-low/40 px-3 py-3 rounded-b-xl w-full">
              <div className="flex items-center gap-1.5 text-secondary font-semibold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+12.0% volume</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">32.4% Enquiry Conversion Rate</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-error font-semibold">Overdue Ledger</span>
                <div className="font-headline-sm text-headline-sm text-error tracking-tight font-bold">PKR 1,240,000</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-error-container/50 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">notification_important</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex flex-col gap-1 bg-surface-container-low/40 px-3 py-3 rounded-b-xl w-full">
              <div className="flex items-center gap-1.5 text-error font-semibold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>8 overdue accounts</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">PKR 640K critical pre-gala locks</span>
            </div>
          </div>
        </section>
        
        {/* 4. Executive Smart Intelligence Banner */}
        <section className="bg-surface-container-lowest rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">workspace_premium</span>
              <h2 className="font-headline-sm text-headline-sm text-primary">Executive Intelligence & Dispatch Alerts</h2>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">2 Actions Pending Verification</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 rounded bg-error-container/20">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error shrink-0">
                <span className="material-symbols-outlined text-[22px]">lock_clock</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-title-sm font-bold text-error">Outstanding Receivables Gate Warning</span>
                  <span className="font-label-sm text-label-sm bg-error text-on-error px-2 py-0.5 rounded font-bold uppercase">Critical</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-1">
                  8 accounts owe <strong>PKR 1,240,000</strong>. Of this, <strong>PKR 640K</strong> remains unsettled for tonight’s EV-2042 Ahsan Malik Walima before gate access & culinary service dispatch.
                </p>
                <div className="mt-3">
                  <a className="inline-flex items-center gap-1 font-label-md text-label-md text-error hover:underline font-bold" href="#">
                    Review Overdue Accounts (8) <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded bg-secondary-container/20">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[22px]">military_tech</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-title-sm font-bold text-secondary">Asset Yield: Royal Grand Hall Surpassed Targets</span>
                  <span className="font-label-sm text-label-sm bg-secondary text-on-secondary px-2 py-0.5 rounded font-bold uppercase">Milestone</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-1">
                  Royal Grand Hall hit <strong>86% prime weekend utilization</strong>; Royal Gold Banquet tier delivered highest gross contribution margin (<strong>PKR 2.10M net surplus</strong>).
                </p>
                <div className="mt-3">
                  <a className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:underline font-bold" href="#">
                    View Detailed P&L Statement <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Reports;
