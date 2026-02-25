import Link from "next/link";
import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.brandTitle}>Contact Us</h1>
            <p className={styles.brandSubtitle}>
              Get in touch with the TORS team
            </p>
          </div>

          <nav className={styles.topActions}>
            <Link href="/login" className={styles.actionLink}>Login</Link>
          </nav>
        </div>

        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <h2 className={styles.pageTitle}>How to Reach Us</h2>
          <p className={styles.description}>
            Have questions about equipment, need assistance with orders, or want to learn more about TORS? Our team is here to help.
          </p>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3> Email</h3>
              <p className={styles.contactDetail}>tors@shu.ac.uk</p>
              <p className={styles.contactNote}>Response within 24 hours</p>
            </div>

            <div className={styles.contactCard}>
              <h3> Phone</h3>
              <p className={styles.contactDetail}>+44 (0)114 225 6555</p>
              <p className={styles.contactNote}>Monday - Friday, 9am - 5pm</p>
            </div>

            <div className={styles.contactCard}>
              <h3> Visit Us</h3>
              <p className={styles.contactDetail}>
                Robert Winston Building<br />
                Sheffield Hallam University<br />
                Collegiate Crescent<br />
                Sheffield, S10 2BP
              </p>
            </div>

            <div className={styles.contactCard}>
              <h3>Equipment Collection</h3>
              <p className={styles.contactDetail}>
                Room 201, Robert Winston Building
              </p>
              <p className={styles.contactNote}>
                Please bring your staff/student ID when collecting equipment<br />
                Collection times: Monday-Friday, 10am-4pm
              </p>
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