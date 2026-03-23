"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./admin.module.css";
import {
  accountRecords,
  chartData,
  reportMetrics,
  requestBreakdown,
  scheduleItems,
} from "./admin-data";

type AdminSection = "reports" | "accounts" | "schedule";

const tabs: { id: AdminSection; label: string; description: string }[] = [
  {
    id: "reports",
    label: "Reports",
    description: "Export metrics, review request volume, and track cost per practical.",
  },
  {
    id: "accounts",
    label: "Manage accounts",
    description: "Review account status, role ownership, and recent access activity.",
  },
  {
    id: "schedule",
    label: "Schedule management",
    description: "See upcoming practical sessions and dummy equipment readiness data.",
  },
];

function downloadFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<AdminSection>("reports");
  const [message, setMessage] = useState("Dummy admin data loaded for frontend review.");

  const handleCsvExport = () => {
    const rows = [
      ["Period", "Requests", "Estimated Cost"],
      ...requestBreakdown.map((row) => [row.period, String(row.requests), String(row.cost)]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    downloadFile("tors-admin-report.csv", csv, "text/csv;charset=utf-8;");
    setMessage("CSV export created from dummy report data.");
  };

  const handleDocExport = () => {
    const content = [
      "TORS Admin Report Summary",
      "",
      ...reportMetrics.map((metric) => `${metric.label}: ${metric.value} - ${metric.detail}`),
      "",
      "Breakdown",
      ...requestBreakdown.map(
        (row) => `${row.period}: ${row.requests} requests, estimated cost GBP ${row.cost}`,
      ),
    ].join("\n");
    downloadFile("tors-admin-report.doc", content, "application/msword");
    setMessage("DOC export created from dummy report data.");
  };

  return (
    <div className={styles.adminSpace}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>TORS Admin Workspace</p>
          <h3 className={styles.heroTitle}>Operations overview for reports, accounts, and schedules</h3>
         
        </div>

        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={handleCsvExport}>
            Export CSV
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleDocExport}>
            Export DOC
          </button>
          <Link href="/dashboard/admin/users" className={styles.userLink}>
            View users
          </Link>
        </div>
      </section>

      <p className={styles.statusNotice}>{message}</p>

      <section className={styles.tabRow} aria-label="Admin sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabDescription}>{tab.description}</span>
          </button>
        ))}
      </section>

      {activeTab === "reports" ? (
        <section className={styles.sectionGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h4 className={styles.panelTitle}>Report summary</h4>
                <p className={styles.panelText}>
                  Covers number of item requests, day/month/year totals, and cost per practical.
                </p>
              </div>
            </div>

            <div className={styles.metricGrid}>
              {reportMetrics.map((metric) => (
                <article key={metric.label} className={styles.metricCard}>
                  <p className={styles.metricLabel}>{metric.label}</p>
                  <p className={styles.metricValue}>{metric.value}</p>
                  <p className={styles.metricText}>{metric.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <h4 className={styles.panelTitle}>Requests by period</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Breakdown</th>
                    <th>Requests</th>
                    <th>Estimated cost</th>
                  </tr>
                </thead>
                <tbody>
                  {requestBreakdown.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      <td>{row.requests}</td>
                      <td>GBP {row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.panel}>
            <h4 className={styles.panelTitle}>Weekly request trend</h4>
            <p className={styles.panelText}>Graphical representation for the current week.</p>
            <div className={styles.chart}>
              {chartData.map((item) => (
                <div key={item.label} className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ height: `${item.value * 10}px` }} />
                  </div>
                  <span className={styles.barValue}>{item.value}</span>
                  <span className={styles.barLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "accounts" ? (
        <section className={styles.sectionGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h4 className={styles.panelTitle}>Manage accounts</h4>
                <p className={styles.panelText}>
                  Dummy account list for approval, suspension, and role management flows.
                </p>
              </div>
              <Link href="/dashboard/admin/users" className={styles.inlineLink}>
                Open user directory
              </Link>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {accountRecords.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.name}</strong>
                        <span className={styles.rowMeta}>{account.id}</span>
                      </td>
                      <td>{account.role}</td>
                      <td>{account.department}</td>
                      <td>
                        <span className={styles[`status${account.status}`]}>{account.status}</span>
                      </td>
                      <td>{account.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "schedule" ? (
        <section className={styles.sectionGrid}>
          <div className={styles.panel}>
            <h4 className={styles.panelTitle}>Schedule management</h4>
            <p className={styles.panelText}>
              Upcoming practicals with dummy readiness tracking for frontend review.
            </p>

            <div className={styles.scheduleList}>
              {scheduleItems.map((item) => (
                <article key={item.id} className={styles.scheduleCard}>
                  <div className={styles.scheduleTop}>
                    <div>
                      <p className={styles.scheduleTitle}>{item.practical}</p>
                      <p className={styles.scheduleMeta}>
                        {item.room} | {item.date} | {item.time}
                      </p>
                    </div>
                    <span className={styles[`status${item.equipmentReady}`]}>
                      {item.equipmentReady}
                    </span>
                  </div>
                  <p className={styles.scheduleLead}>Session lead: {item.lead}</p>
                  <p className={styles.scheduleId}>Reference: {item.id}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
