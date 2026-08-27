import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Footprints, 
  Droplets, 
  Flame, 
  Award, 
  Share2, 
  Download, 
  Printer, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Check, 
  FileText,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const ProgressDashboard = () => {
  const { 
    user, 
    dailyGoals, 
    milestones, 
    trends, 
    meals,
    vitals,
    showToast 
  } = useApp();

  const [timeRange, setTimeRange] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [showExportModal, setShowExportModal] = useState(false);

  const activeTrend = trends[timeRange];

  // Plain-language health insights based on selected range
  const getPlainLanguageSummary = () => {
    if (timeRange === 'daily') {
      return `Today, you've completed ${dailyGoals.stepsCurrent.toLocaleString()} steps and drank ${dailyGoals.waterGlassesCurrent} glasses of water. Your movement and vitals remain steady and well within healthy ranges!`;
    }
    if (timeRange === 'weekly') {
      return `This week, your movement was 14% higher than last week. You achieved your 8-glass water goal on 5 out of 7 days, and your resting heart rate averaged a healthy 72 bpm.`;
    }
    return `Over the past month, you completed 18 low-impact workouts and maintained an active walking routine for 24 days. You've earned 3 new vitality milestone badges!`;
  };

  // Reconciled averages / totals
  const getTotals = () => {
    if (timeRange === 'daily') {
      return {
        steps: dailyGoals.stepsCurrent,
        water: dailyGoals.waterGlassesCurrent,
        calories: dailyGoals.caloriesBurnCurrent
      };
    }
    if (timeRange === 'weekly') {
      const avgSteps = Math.round(activeTrend.steps.reduce((a, b) => a + b, 0) / activeTrend.steps.length);
      const avgWater = (activeTrend.water.reduce((a, b) => a + b, 0) / activeTrend.water.length).toFixed(1);
      const totalCalories = activeTrend.calories.reduce((a, b) => a + b, 0);
      return { steps: avgSteps, water: avgWater, calories: totalCalories };
    }
    const totalSteps = activeTrend.steps.reduce((a, b) => a + b, 0);
    const totalWater = activeTrend.water.reduce((a, b) => a + b, 0);
    const totalCalories = activeTrend.calories.reduce((a, b) => a + b, 0);
    return { steps: totalSteps, water: totalWater, calories: totalCalories };
  };

  const totals = getTotals();

  // Print / Export trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="progress-container fade-in">
      {/* Page Header */}
      <div className="progress-header-row">
        <div>
          <h2 className="page-title">Progress & Trends</h2>
          <p className="page-subtitle">Long-term health patterns, milestones, and physician-ready reports</p>
        </div>

        {/* PROG-6: Export / Share Action */}
        <button
          onClick={() => setShowExportModal(true)}
          className="btn btn-secondary"
          id="prog-btn-export"
        >
          <Share2 size={18} />
          <span>Share / Export Report</span>
        </button>
      </div>

      {/* ======================================================================
          1. Time Range Toggle & Plain Language Summary Panel (PROG-1, PROG-2)
          ====================================================================== */}
      <section className="card card-accent-green summary-panel-card" aria-label="Health Insights Summary">
        <div className="summary-panel-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-green">
              <Sparkles size={14} /> Health Insights
            </span>
          </div>

          {/* Time Range Switcher (PROG-2) */}
          <div className="time-range-toggle-group" role="tablist" aria-label="Time range selector">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`time-toggle-btn ${timeRange === range ? 'active' : ''}`}
                role="tab"
                aria-selected={timeRange === range}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <h3 className="summary-panel-title">
          {timeRange === 'daily' && "Today's Wellness Activity"}
          {timeRange === 'weekly' && "Your Weekly Summary & Trends"}
          {timeRange === 'monthly' && "Monthly Wellness Journey"}
        </h3>
        
        {/* Plain Language Summary (PROG-1) */}
        <p className="summary-panel-desc">
          {getPlainLanguageSummary()}
        </p>

        <div className="summary-highlights-strip">
          <div className="strip-item">
            <UserCheck size={18} className="text-primary-600" />
            <span>Senior Wellness Tier: <strong>Active & Consistent</strong></span>
          </div>
          <div className="strip-item">
            <ShieldCheck size={18} className="text-primary-600" />
            <span>Supervised by: <strong>{user.doctor.split(',')[0]}</strong></span>
          </div>
        </div>
      </section>

      {/* ======================================================================
          2. Three Key Metric Trend Cards (PROG-3, PROG-5)
          ====================================================================== */}
      <section className="metrics-trends-section" aria-label="Core Metrics Breakdown">
        <div className="grid-trend-cards-3">
          {/* Steps Trend Card */}
          <div className="card trend-metric-card">
            <div className="trend-metric-header">
              <div className="flex items-center gap-2">
                <div className="metric-icon-small bg-primary-100 text-primary-700">
                  <Footprints size={20} />
                </div>
                <div>
                  <h4 className="metric-card-title">Walking & Steps</h4>
                  <span className="text-xs text-muted">
                    {timeRange === 'weekly' ? 'Daily Average' : timeRange === 'monthly' ? 'Monthly Total' : 'Today'}
                  </span>
                </div>
              </div>
              <span className="badge badge-green font-bold">+12% vs last</span>
            </div>

            <div className="metric-big-number-row my-3">
              <span className="metric-giant-number">{totals.steps.toLocaleString()}</span>
              <span className="metric-number-unit">steps</span>
            </div>

            {/* Custom Interactive SVG Bar Chart */}
            <div className="mini-chart-container">
              <div className="chart-bars-wrap">
                {activeTrend.steps.map((val, i) => {
                  const maxVal = Math.max(...activeTrend.steps, 7000);
                  const heightPercent = (val / maxVal) * 100;
                  return (
                    <div key={i} className="chart-bar-col">
                      <div className="bar-tooltip">{val.toLocaleString()}</div>
                      <div 
                        className="chart-bar-fill fill-green" 
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="chart-bar-label">{activeTrend.labels[i].split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="metric-footer-note mt-3">Daily Goal: 6,000 steps</p>
          </div>

          {/* Hydration Trend Card */}
          <div className="card trend-metric-card">
            <div className="trend-metric-header">
              <div className="flex items-center gap-2">
                <div className="metric-icon-small bg-blue-100 text-accent-blue">
                  <Droplets size={20} />
                </div>
                <div>
                  <h4 className="metric-card-title">Hydration</h4>
                  <span className="text-xs text-muted">
                    {timeRange === 'weekly' ? 'Daily Average' : timeRange === 'monthly' ? 'Total Glasses' : 'Today'}
                  </span>
                </div>
              </div>
              <span className="badge badge-teal font-bold">Optimal</span>
            </div>

            <div className="metric-big-number-row my-3">
              <span className="metric-giant-number">{totals.water}</span>
              <span className="metric-number-unit">glasses</span>
            </div>

            {/* Water Chart */}
            <div className="mini-chart-container">
              <div className="chart-bars-wrap">
                {activeTrend.water.map((val, i) => {
                  const maxVal = Math.max(...activeTrend.water, 10);
                  const heightPercent = (val / maxVal) * 100;
                  return (
                    <div key={i} className="chart-bar-col">
                      <div className="bar-tooltip">{val} glasses</div>
                      <div 
                        className="chart-bar-fill fill-blue" 
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="chart-bar-label">{activeTrend.labels[i].split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="metric-footer-note mt-3">Target: 8 glasses daily (2.0L)</p>
          </div>

          {/* Calories Trend Card */}
          <div className="card trend-metric-card">
            <div className="trend-metric-header">
              <div className="flex items-center gap-2">
                <div className="metric-icon-small bg-coral-100 text-accent-coral">
                  <Flame size={20} />
                </div>
                <div>
                  <h4 className="metric-card-title">Active Energy</h4>
                  <span className="text-xs text-muted">
                    {timeRange === 'weekly' ? 'Week Total' : timeRange === 'monthly' ? 'Month Total' : 'Today'}
                  </span>
                </div>
              </div>
              <span className="badge badge-amber font-bold">On Track</span>
            </div>

            <div className="metric-big-number-row my-3">
              <span className="metric-giant-number">{totals.calories.toLocaleString()}</span>
              <span className="metric-number-unit">kcal</span>
            </div>

            {/* Calories Chart */}
            <div className="mini-chart-container">
              <div className="chart-bars-wrap">
                {activeTrend.calories.map((val, i) => {
                  const maxVal = Math.max(...activeTrend.calories, 600);
                  const heightPercent = (val / maxVal) * 100;
                  return (
                    <div key={i} className="chart-bar-col">
                      <div className="bar-tooltip">{val} kcal</div>
                      <div 
                        className="chart-bar-fill fill-coral" 
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="chart-bar-label">{activeTrend.labels[i].split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="metric-footer-note mt-3">Target: 450 kcal daily movement</p>
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. "Milestones Achieved" Module (PROG-4)
          ====================================================================== */}
      <section className="milestones-section" aria-label="Milestones Achieved">
        <div className="section-header">
          <div>
            <h3 className="section-title">Milestones & Achievements</h3>
            <p className="section-subtitle">Celebrating consistency, hydration habits, and movement streaks</p>
          </div>
          <span className="badge badge-amber">
            <Award size={14} /> {milestones.filter(m => m.achieved).length} Badges Earned
          </span>
        </div>

        <div className="grid-milestones-cards">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id} 
              className={`card milestone-card ${milestone.achieved ? 'milestone-unlocked' : 'milestone-locked'}`}
            >
              <div className="milestone-icon-circle">
                <Award size={28} className={milestone.achieved ? 'text-accent-amber' : 'text-muted'} />
              </div>
              <div className="milestone-content">
                <div className="flex justify-between items-center">
                  <span className="badge badge-green">{milestone.rewardText}</span>
                  {milestone.achieved && (
                    <span className="text-xs font-bold text-primary-700 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}
                </div>
                <h4 className="milestone-title mt-1">{milestone.title}</h4>
                <p className="milestone-desc">{milestone.desc}</p>
                <p className="milestone-date-text mt-2">
                  <Calendar size={12} className="inline mr-1 opacity-70" />
                  {milestone.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================
          4. Export / Share Health Report Modal (PROG-6)
          ====================================================================== */}
      {showExportModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
          <div className="modal-content export-modal-box fade-in">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileText size={22} className="text-primary-600" />
                <h3 id="export-modal-title" className="font-extrabold text-xl text-primary-900">
                  Caregiver & Physician Health Summary
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            {/* Printable Report Sheet */}
            <div className="printable-report-sheet" id="caregiver-report-view">
              <div className="report-header-banner">
                <div>
                  <h4 className="report-brand">Vitality Senior Wellness Companion</h4>
                  <p className="text-xs text-muted">Weekly Health & Adherence Summary Report</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary-900">Date: August 25, 2026</p>
                  <p className="text-xs text-muted">Tier: Senior Member</p>
                </div>
              </div>

              <div className="report-patient-info my-3">
                <p><strong>Member Name:</strong> {user.name} ({user.age} yrs)</p>
                <p><strong>Primary Physician:</strong> {user.doctor}</p>
                <p><strong>Emergency Contact:</strong> {user.emergencyContact.name} ({user.emergencyContact.relation}) - {user.emergencyContact.phone}</p>
                <p><strong>Known Conditions:</strong> {user.medicalConditions.join(', ')}</p>
              </div>

              <div className="report-metrics-table my-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-subtle border-b border-light">
                      <th className="p-2">Metric</th>
                      <th className="p-2">Current Value</th>
                      <th className="p-2">Target Goal</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-light">
                      <td className="p-2 font-semibold">Average Steps / Day</td>
                      <td className="p-2">{totals.steps.toLocaleString()}</td>
                      <td className="p-2">6,000</td>
                      <td className="p-2 text-primary-700 font-bold">Good Adherence</td>
                    </tr>
                    <tr className="border-b border-light">
                      <td className="p-2 font-semibold">Hydration Average</td>
                      <td className="p-2">{totals.water} glasses</td>
                      <td className="p-2">8 glasses</td>
                      <td className="p-2 text-primary-700 font-bold">Optimal</td>
                    </tr>
                    <tr className="border-b border-light">
                      <td className="p-2 font-semibold">Resting Heart Rate</td>
                      <td className="p-2">{vitals.heartRate} bpm</td>
                      <td className="p-2">60 - 100 bpm</td>
                      <td className="p-2 text-primary-700 font-bold">Normal / Stable</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Blood Pressure</td>
                      <td className="p-2">{vitals.bloodPressure} mmHg</td>
                      <td className="p-2">&lt; 130/80 mmHg</td>
                      <td className="p-2 text-primary-700 font-bold">Controlled</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-secondary mt-3 italic">
                * Note: Generated by Vitality Wellness Companion. Data is verified through user logging and movement sensor tracking.
              </p>
            </div>

            <div className="export-modal-actions mt-4">
              <button
                onClick={handlePrint}
                className="btn btn-primary flex-1"
              >
                <Printer size={18} />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={() => {
                  showToast(`✉️ Summary report securely sent to ${user.emergencyContact.name}!`);
                  setShowExportModal(false);
                }}
                className="btn btn-secondary flex-1"
              >
                <Share2 size={18} />
                <span>Send to Caregiver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .progress-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .progress-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        /* Summary Panel */
        .summary-panel-card {
          padding: 2rem;
        }

        .summary-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .time-range-toggle-group {
          display: flex;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          padding: 0.25rem;
        }

        .time-toggle-btn {
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--text-secondary);
          min-height: 38px;
        }

        .time-toggle-btn.active {
          background-color: var(--primary-600);
          color: #ffffff;
        }

        .summary-panel-title {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--primary-900);
          margin-bottom: 0.6rem;
        }

        .summary-panel-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 850px;
        }

        .summary-highlights-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--primary-200);
        }

        .strip-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: var(--text-xs);
          color: var(--text-primary);
        }

        /* 3-Column Trend Cards */
        .grid-trend-cards-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .grid-trend-cards-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .trend-metric-card {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }

        .trend-metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .metric-icon-small {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-primary-100 { background-color: var(--primary-100); }
        .bg-blue-100 { background-color: #e0f2fe; }
        .bg-coral-100 { background-color: var(--accent-coral-light); }

        .metric-card-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .metric-big-number-row {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .metric-giant-number {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .metric-number-unit {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Mini Bar Chart */
        .mini-chart-container {
          height: 110px;
          display: flex;
          align-items: flex-end;
          margin-top: auto;
          padding-top: 1rem;
        }

        .chart-bars-wrap {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: flex-end;
          justify-content: space-between;
          gap: 0.35rem;
        }

        .chart-bar-col {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          position: relative;
        }

        .chart-bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.8s ease-in-out;
          min-height: 4px;
        }

        .fill-green {
          background: linear-gradient(180deg, var(--primary-400), var(--primary-600));
        }

        .fill-blue {
          background: linear-gradient(180deg, #60a5fa, #2563eb);
        }

        .fill-coral {
          background: linear-gradient(180deg, #f87171, #dc2626);
        }

        .chart-bar-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 0.35rem;
        }

        .bar-tooltip {
          position: absolute;
          top: -24px;
          background: #1f2937;
          color: white;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          transition: opacity 0.2s;
        }

        .chart-bar-col:hover .bar-tooltip {
          opacity: 1;
        }

        .metric-footer-note {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Milestones */
        .milestones-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .grid-milestones-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 640px) {
          .grid-milestones-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .grid-milestones-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .milestone-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.5rem;
        }

        .milestone-unlocked {
          background: linear-gradient(145deg, var(--accent-amber-light), var(--bg-surface));
          border-color: #fed19d;
        }

        .milestone-locked {
          opacity: 0.65;
          background-color: var(--bg-surface-subtle);
        }

        .milestone-icon-circle {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-medium);
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-title {
          font-size: var(--text-base);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .milestone-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .milestone-date-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Printable Modal Sheet */
        .export-modal-box {
          max-width: 650px;
        }

        .printable-report-sheet {
          background: #ffffff;
          border: 1.5px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          color: #1f2937;
        }

        .report-header-banner {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--primary-500);
          padding-bottom: 0.75rem;
        }

        .report-brand {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary-700);
        }

        .report-patient-info {
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .export-modal-actions {
          display: flex;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};
