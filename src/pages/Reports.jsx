import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    FileText
} from 'lucide-react';

const ReportCard = ({ title, value, trend, trendValue, icon: Icon }) => (
    <div className="glass-card report-card">
        <div className="report-card-header">
            <div className="icon-box"><Icon size={20} /></div>
            <div className={`trend-pill ${trend}`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{trendValue}</span>
            </div>
        </div>
        <div className="report-card-body">
            <p className="report-title">{title}</p>
            <h3>{value}</h3>
        </div>
    </div>
);

const Reports = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="reports-page"
        >
            <div className="page-header">
                <div>
                    <h1>Intelligence Hub</h1>
                    <p>Financial analytics and operational performance auditing</p>
                </div>
                <div className="header-actions">
                    <button className="glass-btn with-icon">
                        <Calendar size={18} />
                        <span>Oct 2026</span>
                    </button>
                    <button className="premium-btn with-icon">
                        <Download size={18} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            <div className="reports-grid">
                <ReportCard
                    title="Gross Revenue"
                    value="Rs. 4.2M"
                    trend="up"
                    trendValue="18%"
                    icon={TrendingUp}
                />
                <ReportCard
                    title="Recovery Efficiency"
                    value="94.2%"
                    trend="up"
                    trendValue="2.4%"
                    icon={PieChart}
                />
                <ReportCard
                    title="Operating Costs"
                    value="Rs. 840K"
                    trend="down"
                    trendValue="5.1%"
                    icon={BarChart3}
                />
                <ReportCard
                    title="Inventory Assets"
                    value="Rs. 12.8M"
                    trend="up"
                    trendValue="8.2%"
                    icon={FileText}
                />
            </div>

            <div className="analytics-section">
                <div className="glass-card chart-container large">
                    <div className="chart-header">
                        <h3>Revenue Projection</h3>
                        <div className="chart-tabs">
                            <button className="tab-min active">Weekly</button>
                            <button className="tab-min">Monthly</button>
                        </div>
                    </div>
                    <div className="visual-placeholder">
                        {/* Dynamic chart logic would go here */}
                        <div className="wave-bg"></div>
                        <p className="placeholder-text">Revenue Growth Visualization Engine</p>
                    </div>
                </div>

                <div className="glass-card log-container">
                    <div className="log-header">
                        <h3>Audit Log</h3>
                        <button className="text-btn">View All</button>
                    </div>
                    <div className="log-list">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="log-item">
                                <div className="log-dot"></div>
                                <div className="log-content">
                                    <p className="log-text">Inventory Stock Reconciled by <strong>Admin</strong></p>
                                    <span className="log-time">2 hours ago</span>
                                </div>
                                <ChevronRight size={14} className="text-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .report-card { padding: 24px; }
        .report-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .icon-box {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .trend-pill {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .trend-pill.up { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .trend-pill.down { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        .report-title { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
        .report-card-body h3 { font-size: 24px; font-weight: 700; }

        .analytics-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .chart-container, .log-container { padding: 24px; }
        .chart-header, .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .chart-tabs { display: flex; gap: 8px; background: rgba(0,0,0,0.1); padding: 4px; border-radius: 8px; }
        .tab-min { background: none; border: none; font-size: 11px; font-weight: 600; color: var(--text-muted); padding: 4px 12px; border-radius: 6px; }
        .tab-min.active { background: var(--primary); color: white; }
        
        .visual-placeholder {
          height: 300px;
          background: rgba(255,255,255,0.01);
          border: 1px dashed var(--border-color);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .wave-bg {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(to top, rgba(99, 102, 241, 0.1), transparent);
        }
        .placeholder-text { font-size: 14px; color: var(--text-muted); opacity: 0.5; font-style: italic; }

        .log-list { display: flex; flex-direction: column; gap: 16px; }
        .log-item { display: flex; align-items: center; gap: 16px; }
        .log-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 10px var(--primary); }
        .log-content { flex: 1; }
        .log-text { font-size: 13px; margin: 0; color: var(--text-main); }
        .log-text strong { color: var(--secondary); }
        .log-time { font-size: 11px; color: var(--text-muted); }
      `}} />
        </motion.div>
    );
};

export default Reports;
