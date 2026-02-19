import LogoutButton from "../logout-button";
import styles from "./cart.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Your Cart</h1>
        </div>

        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          <LogoutButton />
        </nav>
      </header>

     

      <section className={styles.features}>
        <h2>Items</h2>
        
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
