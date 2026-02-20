import { createServerSupabase } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import bookingStyles from "./booking.module.css";

export default async function BookingPage() {
  const supabase = await createServerSupabase();

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/Login");
  }

  // Fetch user data from accounts table
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const displayName = account?.forename || session.user.email?.split('@')[0] || "User";

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

          <div className={styles.topActions}>
            <Link href="/dashboard" className={styles.actionLink}>
              Dashboard
            </Link>
            <Link className={styles.actionLink} href="/dashboard/account">
              Account
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Equipment Booking</h2>
            <span className={styles.badge}>Welcome, {displayName}</span>
          </div>

          <div className={bookingStyles.bookingContainer}>
            <div className={bookingStyles.bookingCard}>
              <h3 className={bookingStyles.cardTitle}>Book Equipment for Your Lesson</h3>
              <p className={bookingStyles.cardDescription}>
                Select the equipment you need, specify your room, and choose your preferred date and time for delivery.
              </p>

              <form className={bookingStyles.form}>
                {/* Equipment Selection Section */}
                <div className={bookingStyles.formSection}>
                  <h4 className={bookingStyles.sectionTitle}>Equipment Selection</h4>
                  <p className={bookingStyles.sectionDescription}>Choose the equipment you need for your practical session</p>

                  <div className={bookingStyles.equipmentGrid}>
                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq1" name="equipment" value="stethoscope" className={bookingStyles.checkbox} />
                      <label htmlFor="eq1" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>Stethoscope</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 25</span>
                      </label>
                    </div>

                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq2" name="equipment" value="defibrillator" className={bookingStyles.checkbox} />
                      <label htmlFor="eq2" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>Defibrillator</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 5</span>
                      </label>
                    </div>

                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq3" name="equipment" value="blood-pressure" className={bookingStyles.checkbox} />
                      <label htmlFor="eq3" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>Blood Pressure Monitor</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 15</span>
                      </label>
                    </div>

                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq4" name="equipment" value="thermometer" className={bookingStyles.checkbox} />
                      <label htmlFor="eq4" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>Digital Thermometer</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 30</span>
                      </label>
                    </div>

                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq5" name="equipment" value="manikin" className={bookingStyles.checkbox} />
                      <label htmlFor="eq5" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>CPR Manikin</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 8</span>
                      </label>
                    </div>

                    <div className={bookingStyles.equipmentItem}>
                      <input type="checkbox" id="eq6" name="equipment" value="bandages" className={bookingStyles.checkbox} />
                      <label htmlFor="eq6" className={bookingStyles.checkboxLabel}>
                        <span className={bookingStyles.checkboxText}>Sterile Bandage Pack</span>
                        <span className={bookingStyles.checkboxDesc}>Quantity: 50</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Room & Date Section */}
                <div className={bookingStyles.formSection}>
                  <h4 className={bookingStyles.sectionTitle}>Booking Details</h4>

                  <div className={bookingStyles.formGrid}>
                    <div className={bookingStyles.formGroup}>
                      <label htmlFor="room" className={bookingStyles.label}>
                        Room
                        <span className={bookingStyles.required}>*</span>
                      </label>
                      <select id="room" name="room" className={bookingStyles.select} required>
                        <option value="">Select a room</option>
                        <option value="lab-a">Lab A</option>
                        <option value="lab-b">Lab B</option>
                        <option value="simulation-1">Simulation Lab 1</option>
                        <option value="simulation-2">Simulation Lab 2</option>
                        <option value="clinical-skills">Clinical Skills Suite</option>
                        <option value="lecture-1">Lecture Room 1</option>
                        <option value="lecture-2">Lecture Room 2</option>
                      </select>
                    </div>

                    <div className={bookingStyles.formGroup}>
                      <label htmlFor="date" className={bookingStyles.label}>
                        Date
                        <span className={bookingStyles.required}>*</span>
                      </label>
                      <input type="date" id="date" name="date" className={bookingStyles.input} required />
                    </div>

                    <div className={bookingStyles.formGroup}>
                      <label htmlFor="time" className={bookingStyles.label}>
                        Time
                        <span className={bookingStyles.required}>*</span>
                      </label>
                      <input type="time" id="time" name="time" className={bookingStyles.input} required />
                    </div>

                    <div className={bookingStyles.formGroup}>
                      <label htmlFor="duration" className={bookingStyles.label}>
                        Duration (hours)
                        <span className={bookingStyles.required}>*</span>
                      </label>
                      <input type="number" id="duration" name="duration" min="1" max="8" className={bookingStyles.input} placeholder="e.g., 2" required />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className={bookingStyles.formSection}>
                  <h4 className={bookingStyles.sectionTitle}>Additional Information</h4>

                  <div className={bookingStyles.formGroup}>
                    <label htmlFor="notes" className={bookingStyles.label}>
                      Special Notes or Requirements
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      className={bookingStyles.textarea}
                      placeholder="Any special requirements, health & safety concerns, or additional notes..."
                      rows={4}
                    ></textarea>
                  </div>

                  <div className={bookingStyles.formGroup}>
                    <label htmlFor="students" className={bookingStyles.label}>
                      Number of Students
                    </label>
                    <input type="number" id="students" name="students" min="1" className={bookingStyles.input} placeholder="e.g., 25" />
                  </div>
                </div>

                {/* Form Actions */}
                <div className={bookingStyles.formActions}>
                  <button type="submit" className={bookingStyles.submitBtn}>
                    Submit Booking Request
                  </button>
                  <Link href="/dashboard" className={bookingStyles.cancelBtn}>
                    Back to Dashboard
                  </Link>
                </div>
              </form>
            </div>

            {/* Info Cards */}
            <div className={bookingStyles.infoCards}>
              <div className={bookingStyles.infoCard}>
                <h5 className={bookingStyles.infoCardTitle}>📋 Booking Timeline</h5>
                <ul className={bookingStyles.infoList}>
                  <li>Submit your request at least 3 days before your lesson</li>
                  <li>TORS team will review and confirm availability</li>
                  <li>Equipment will be delivered to your room on the scheduled date</li>
                  <li>Technical team will set up all items</li>
                </ul>
              </div>

              <div className={bookingStyles.infoCard}>
                <h5 className={bookingStyles.infoCardTitle}>⚠️ Important Notes</h5>
                <ul className={bookingStyles.infoList}>
                  <li>Health & Safety risk assessments must be attached</li>
                  <li>Equipment must be collected/picked up after use</li>
                  <li>Any breakages or damages must be reported immediately</li>
                  <li>Contact TORS team for urgent last-minute requests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© 2026 TORS Health Equipment Ordering System</footer>
    </div>
  );
}
