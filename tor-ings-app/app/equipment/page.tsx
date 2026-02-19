import styles from "./equipment.module.css";
import Link from "next/link";

export default function EquipmentPage() {
  return (
    <main className={styles.main}>

      
   
      <div className={styles.box}>
        <div className={styles.itembox}>
          <div className={styles.imagebox}></div>

          <div className={styles.textArea}>
            <div className={styles.topRow}>
            <h2>Name</h2>

            <div className={styles.cartControls}>
              <div className={styles.qtyArea}>
                <label>Qty</label>
                <select>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
                </div>

                  <button className={styles.addBtn}>
                    Add to cart
                  </button>
              </div>
            </div>

            <p>DESCRIPTION HERE PLS :</p>
          </div>
        </div>
        <div className={styles.itembox}>
          <div className={styles.imagebox}></div>

          <div className={styles.textArea}>
            <div className={styles.topRow}>
            <h2>Name</h2>

            <div className={styles.cartControls}>
              <div className={styles.qtyArea}>
                <label>Qty</label>
                <select>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
                </div>

                  <button className={styles.addBtn}>
                    Add to cart
                  </button>
              </div>
            </div>

            <p>DESCRIPTION HERE PLS :</p>
          </div>
        </div>
        
        <div className={styles.itembox}>
          <div className={styles.imagebox}></div>

          <div className={styles.textArea}>
            <div className={styles.topRow}>
            <h2>Name</h2>

            <div className={styles.cartControls}>
              <div className={styles.qtyArea}>
                <label>Qty</label>
                <select>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
                </div>

                  <button className={styles.addBtn}>
                    Add to cart
                  </button>
              </div>
            </div>

            <p>DESCRIPTION HERE PLS :</p>
          </div>
        </div>
        <div className={styles.itembox}>
          <div className={styles.imagebox}></div>

          <div className={styles.textArea}>
            <div className={styles.topRow}>
            <h2>Name</h2>

            <div className={styles.cartControls}>
              <div className={styles.qtyArea}>
                <label>Qty</label>
                <select>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                </select>
                </div>

                  <button className={styles.addBtn}>
                    Add to cart
                  </button>
              </div>
            </div>

            <p>DESCRIPTION HERE PLS :</p>
          </div>
        </div>



      </div>

      

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </footer>

    </main>
  );
}