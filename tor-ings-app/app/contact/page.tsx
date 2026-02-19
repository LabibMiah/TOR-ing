import styles from "./contact.module.css";
import Link from "next/link";

export default function Contact() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>Get in touch with the TORS team</p>
        </div>

        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

      <section className={styles.contactSection}>
        <h2>How to Reach Us</h2>
        <p className={styles.sectionDescription}>
          Have questions about equipment, need assistance with orders, or want to learn more about TORS?
          Our team is here to help.
        </p>

        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}></div>
            <h3>Email</h3>
            <p className={styles.contactDetail}>
              <a href="mailto:tors@shu.ac.uk">tors@shu.ac.uk</a>
            </p>
            <p className={styles.contactDetail}>Response within 24 hours</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}></div>
            <h3>Phone</h3>
            <p className={styles.contactDetail}>
              <a href="tel:+441142256555">+44 (0)114 225 6555</a>
            </p>
            <p className={styles.contactDetail}>Monday - Friday, 9am - 5pm</p>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.iconWrapper}></div>
            <h3>Visit Us</h3>
            <p className={styles.contactDetail}>
              Robert Winston Building<br />
              Sheffield Hallam University<br />
              Collegiate Crescent<br />
              Sheffield, S10 2BP
            </p>
          </div>
        </div>

        <div className={styles.locationCard}>
          <h3>Equipment Collection Point</h3>
          <p className={styles.locationDetail}>
            <span className={styles.buildingName}>Room 201, Robert Winston Building</span><br />
            Please bring your staff/student ID when collecting equipment<br />
            Collection times: Monday-Friday, 10am-4pm
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}