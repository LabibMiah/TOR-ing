// app/dashboard/layout.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css"; // Import the CSS

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      {children}
      
      {/* Add footer here */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
            <Link 
              href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              About TORS
            </Link>
            <Link 
              href="https://www.shu.ac.uk/about-this-website/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Privacy
            </Link>
            <Link 
              href="https://www.shu.ac.uk/about-this-website/terms-and-conditions" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}