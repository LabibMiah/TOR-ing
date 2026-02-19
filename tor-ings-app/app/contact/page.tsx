import styles from "./contact.module.css";
import Link from "next/link";



export default function Contact() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Contacts</h1>
      
        <nav className={styles.nav}>

          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="about">About</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <h2>Welcome</h2>
          <p>Please contact ... for any further information </p>
        </div>
      </section>

      <footer className={styles.footer}>
        © 2026 My Website
      </footer>
    </main>
  );
}
