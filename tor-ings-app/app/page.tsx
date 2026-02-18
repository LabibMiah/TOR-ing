import styles from "./home.module.css";
import Link from "next/link";



export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Welcome To TOR-ings</h1>
        <h2>Powered By Sheffield Hallam</h2>

        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>

          
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <h2>Welcome</h2>
          <p>...</p>
        </div>
      </section>

      <footer className={styles.footer}>
        © 2026 My Website
      </footer>
    </main>
  );
}
