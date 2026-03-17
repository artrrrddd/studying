import styles from './GlassLite.module.css';

export default function GlassLite({
  children,
  className = '',
  as: Tag = 'div',
  glare = true,
  ...props
}) {
  return (
    <Tag className={`${styles.glass} ${className}`.trim()} {...props}>
      {glare && <span className={styles.glare} aria-hidden="true" />}
      <span className={styles.edge} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </Tag>
  );
}