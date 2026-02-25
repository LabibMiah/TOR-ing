import styles from "./landing.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.brandTitle}>
              TORS Health Equipment Ordering Catalogue
            </h1>
            <p className={styles.brandSubtitle}>
              School of Healthcare - Sheffield Hallam University
            </p>
          </div>

          <nav className={styles.topActions}>
            <Link href="/login" className={styles.actionLink}>Login</Link>
          </nav>
        </div>

        <nav className={styles.nav}>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureNumber}>01</div>
              <h3>Interactive Catalogue</h3>
              <p>A comprehensive catalogue of all health equipment and consumables available in the School of Healthcare. Academics can easily browse, select, and order items while maintaining full control over their procurement needs.</p>
              <ul className={styles.featureList}>
                <li>Clear sectional layout organized by specialism with images</li>
                <li>Real-time equipment quantities and availability status</li>
                <li>Digital equipment forms and shopping lists</li>
                <li>Link requests to specific lessons, rooms, and calendars</li>
                <li>File attachments support (e.g., moulage images, risk assessments)</li>
                <li>Custom "Other" option for non-stock items</li>
                <li>Multiple academics can collaborate on list creation</li>
                <li>Request status indicators (submitted, reviewed, actioned)</li>
                <li>Audit trail showing creation date, modifications, and usage history</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureNumber}>02</div>
              <h3>Planning Interface</h3>
              <p>Dedicated workspace for the TORS team to monitor, analyze, and manage incoming equipment requests. Smart organization tools ensure efficient scheduling and allocation of resources across practical lessons and room availability.</p>
              <ul className={styles.featureList}>
                <li>Automated notifications by equipment type</li>
                <li>Easy-to-read formatted equipment and consumables lists</li>
                <li>Intelligent equipment scheduler with double-booking conflict detection</li>
                <li>Weekly calendar view by room breakdown with print functionality</li>
                <li>Notes system for consumable ordering and delivery tracking</li>
                <li>Technical support requirement field</li>
                <li>Communication audit trail with academics</li>
                <li>Linked COSHH Data Sheets for chemicals and cleaning fluids</li>
                <li>CSV import from timetabling systems for seamless integration</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureNumber}>03</div>
              <h3>Set-ups Management</h3>
              <p>Essential view for the technical team to manage daily setup operations. Organize, track, and complete equipment preparation tasks with clear visibility and printable documentation for practical sessions and simulations.</p>
              <ul className={styles.featureList}>
                <li>Daily task lists based on equipment requests and timetables</li>
                <li>Equipment pickup checklists with completion tracking</li>
                <li>Task status management (setup, consumables refresh, strip-down)</li>
                <li>Technician assignment and task allocation</li>
                <li>Print-ready setup sheets in easy-to-read formats</li>
                <li>Consumables management and tracking</li>
                <li>Task completion marking and equipment return tracking</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureNumber}>04</div>
              <h3>Reports & Analytics</h3>
              <p>Powerful reporting system providing detailed insights into equipment usage, costs, and operations. Generate customizable reports with flexible filtering, analytics, and easy export capability for business intelligence and planning.</p>
              <ul className={styles.featureList}>
                <li>Equipment requests and room setups tracking</li>
                <li>Day, month, and year breakdown analytics</li>
                <li>Equipment usage patterns and frequency analysis</li>
                <li>Cost per practical and budget analysis</li>
                <li>User activity and engagement tracking</li>
                <li>Graphical representation of key metrics</li>
                <li>Excel and Word export capabilities</li>
                <li>Flexible filtering and customizable report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

     <footer className={styles.footer}>
  <div className={styles.footerContent}>
    <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
    <nav className={styles.footerNav}>
      <Link href="/contact">Contact</Link>
      <Link href="/about">About</Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        TORS Info
      </Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        Privacy
      </Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        Terms
      </Link>
    </nav>
  </div>
</footer>
    </div>
  );
}