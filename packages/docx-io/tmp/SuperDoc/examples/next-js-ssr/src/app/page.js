import styles from "./page.module.css";

import SuperDoc from "./SuperDoc/superdoc.js";

export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h2>SuperDoc: Next.js example</h2>
        <p>In this example we load a basic SuperDoc instance in next.js</p>
        <SuperDoc />
      </main>
    </div>
  );
}
