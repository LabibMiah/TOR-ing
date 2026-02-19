import styles from "./landing.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>TORS Health Equipment Ordering Catalogue</h1>
          <p className={styles.subtitle}>School of Healthcare - Sheffield Hallam University</p>
        </div>

        <nav className={styles.nav}>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/Login">Login</Link>
        </nav>
      </header>

      <section className={styles.features}>
        <h2>The Four Core Components</h2>
        <p style={{ textAlign: "center", color: "#672146", marginBottom: "50px", fontSize: "1.1rem", lineHeight: "1.6" }}>
          A comprehensive system designed to streamline health equipment ordering, planning, and management across the School of Healthcare. 
        </p>
        
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
              <li>Automated notifications by equipment type (equipment, consumables, moulage, XR/VR)</li>
              <li>Easy-to-read formatted equipment and consumables lists with quantities</li>
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
      </section>

      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px", width: "100%" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.2rem", color: "#672146", marginBottom: "40px", fontWeight: "700" }}>
          Key System Benefits
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Role-Based Access Control</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Flexible user permission system ensures academics, TORS team, and technical staff access only the features and data relevant to their roles.</p>
          </div>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Accessibility First Design</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Fully compliant with WCAG 2.2 Level AA standards, ensuring all users, regardless of abilities, can effectively access and use the platform.</p>
          </div>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Integrated Communication</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Two-way communication portal enables academics and TORS team to discuss equipment requests, resolve scheduling conflicts, and answer queries efficiently.</p>
          </div>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Complete Audit Trail</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Track all changes, communications, and usage history with full audit logs for compliance and quality assurance purposes.</p>
          </div>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Conflict Detection</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Intelligent scheduling system automatically flags double-bookings and conflicts, ensuring efficient room and equipment allocation.</p>
          </div>
          <div style={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", borderLeft: "5px solid #E31C79" }}>
            <h4 style={{ color: "#672146", marginBottom: "15px", fontSize: "1.2rem" }}>Export & Printing</h4>
            <p style={{ color: "#555", lineHeight: "1.6" }}>Easy export to Excel and Word formats, with print-ready options for schedules, checklists, and reports for physical display and distribution.</p>
          </div>
        </div>
      </section>
    
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
