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
          <Link href="/">Home</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

     

      <section className={styles.features}>
        <h2>The Four Core Components</h2>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>01</div>
            <h3>Interactive Catalogue</h3>
            <p>Browse and order equipment and consumables with an intuitive interface. Create shopping lists, link to lessons and calendars, and manage your request forms with ease.</p>
            <ul className={styles.featureList}>
              <li>Clear sectional layout with images</li>
              <li>Equipment quantities and availability</li>
              <li>Digital equipment forms</li>
              <li>File attachments</li>
              <li>Free text "Other" options</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>02</div>
            <h3>Planning Interface</h3>
            <p>Behind-the-scenes management system for the TORS team to monitor, organize, and schedule equipment requests based on room availability and lesson timing.</p>
            <ul className={styles.featureList}>
              <li>Smart notifications by equipment type</li>
              <li>Easy-to-read equipment lists</li>
              <li>Equipment scheduler</li>
              <li>Printable weekly calendars</li>
              <li>Conflict detection</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>03</div>
            <h3>Set-ups Management</h3>
            <p>Technical team view for managing daily setup tasks, equipment pickup, and completion tracking with printable setup sheets.</p>
            <ul className={styles.featureList}>
              <li>Daily task lists</li>
              <li>Equipment pickup checklist</li>
              <li>Task completion tracking</li>
              <li>Print-ready formats</li>
              <li>Consumables management</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>04</div>
            <h3>Reports & Analytics</h3>
            <p>Generate detailed reports on equipment usage, costs, user activity, and room setups with flexible filtering and easy export options.</p>
            <ul className={styles.featureList}>
              <li>Configurable reports</li>
              <li>Usage analytics</li>
              <li>Cost breakdown</li>
              <li>User activity tracking</li>
              <li>Excel/Word export</li>
            </ul>
          </div>
        </div>
      </section>

    
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p> 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}