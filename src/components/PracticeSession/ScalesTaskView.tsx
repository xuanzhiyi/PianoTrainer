import type { ScalesTask } from '../../types'
import { formatTime } from '../../utils/formatTime'
import styles from './TaskView.module.css'

interface ScalesTaskViewProps {
  task: ScalesTask
  elapsedSeconds: number
  remainingSeconds: number
  isPlaying: boolean
  onSkip: () => void
}

export function ScalesTaskView({
  task,
  elapsedSeconds,
  remainingSeconds,
  isPlaying,
  onSkip,
}: ScalesTaskViewProps) {
  const totalSeconds = task.durationMinutes * 60
  const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0

  return (
    <div className={styles.taskCard}>
      <p className={styles.taskTypeLabel}>Scales Practice</p>
      <div className={styles.timerDisplay}>{formatTime(remainingSeconds)}</div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <p className={styles.progressText}>
        {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
      </p>

      <div className={`${styles.statusBadge} ${isPlaying ? styles.statusPlaying : styles.statusPaused}`}>
        {isPlaying ? '▶ Playing — timer running' : '⏸ Silent — timer paused'}
      </div>

      <button className={styles.skipBtn} onClick={onSkip}>
        Skip task
      </button>
    </div>
  )
}
