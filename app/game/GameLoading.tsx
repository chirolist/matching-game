import styles from "../page.module.css";
import { TOTAL_CARDS, TOTAL_PAIRS } from "./deck";

export default function GameLoading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>神経衰弱</h1>
          <p>同じ絵柄のカードを2枚選んで、すべてのペアをそろえよう</p>
        </header>
        <section className={styles.stats} aria-label="ゲーム情報">
          <p>ペア：0 / {TOTAL_PAIRS}</p>
          <p>手数：0</p>
          <p className={styles.timer}>00:00</p>
        </section>
        <div className={styles.board} aria-hidden="true">
          {Array.from({ length: TOTAL_CARDS }, (_, index) => (
            <div key={index} className={styles.card}>
              <span className={styles.inner}>
                <span className={styles.back}>
                  <span className={styles.mark}>？</span>
                </span>
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
