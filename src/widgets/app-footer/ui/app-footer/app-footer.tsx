import styles from './app-footer.module.scss';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/MikhailKrivosheev' },
  {
    label: 'Резюме',
    href: 'https://drive.google.com/file/d/1fE-VbvN9fXrZBle18GfpuLJcqQ3nPg9e/view?usp=sharing',
  },
] as const;

function AppFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.group}>Тестовое задание ZalogHub</span>
      <span className={styles.groupSeparator} aria-hidden="true">
        ·
      </span>
      <span className={styles.group}>
        Михаил Кривошеев
        {LINKS.map(({ label, href }) => (
          <span key={href} className={styles.group}>
            <span aria-hidden="true">·</span>
            <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
              {label}
              <span className={styles.visuallyHidden}> (откроется в новой вкладке)</span>
            </a>
          </span>
        ))}
      </span>
    </footer>
  );
}

export default AppFooter;
