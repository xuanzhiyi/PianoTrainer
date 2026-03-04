import styles from './AudioIndicator.module.css'

interface AudioIndicatorProps {
  volume: number
  isPlaying: boolean
  permissionState: 'idle' | 'granted' | 'denied' | 'error'
  error: string | null
}

const NUM_BARS = 12

export function AudioIndicator({
  volume,
  isPlaying,
  permissionState,
  error,
}: AudioIndicatorProps) {
  if (permissionState === 'idle') {
    return (
      <div className={styles.wrapper}>
        <span className={styles.label}>Waiting for microphone…</span>
      </div>
    )
  }

  if (permissionState === 'denied' || permissionState === 'error') {
    return (
      <div className={styles.wrapper}>
        <span className={`${styles.label} ${styles.error}`}>
          {error ?? 'Microphone unavailable'}
        </span>
      </div>
    )
  }

  const bars = Array.from({ length: NUM_BARS }, (_, i) => {
    const threshold = ((i + 1) / NUM_BARS) * 100
    const active = volume >= threshold
    return (
      <div
        key={i}
        className={`${styles.bar} ${active ? styles.barActive : ''}`}
        style={{ height: `${8 + (i / NUM_BARS) * 24}px` }}
      />
    )
  })

  return (
    <div className={styles.wrapper}>
      <div className={styles.bars}>{bars}</div>
      <span className={`${styles.label} ${isPlaying ? styles.playing : styles.silent}`}>
        {isPlaying ? 'Playing' : 'Silent'}
      </span>
    </div>
  )
}
