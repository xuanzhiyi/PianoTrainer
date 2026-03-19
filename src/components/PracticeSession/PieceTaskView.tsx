import type { PieceTask } from '../../types'
import styles from './TaskView.module.css'

interface PieceTaskViewProps {
  task: PieceTask
  currentRound: number
  isPlaying: boolean
  pendingRoundCompletion: boolean
  onSkip: () => void
}

export function PieceTaskView({ task, currentRound, isPlaying, pendingRoundCompletion, onSkip }: PieceTaskViewProps) {
  const progress = task.rounds > 0 ? currentRound / task.rounds : 0

  const statusClass = isPlaying
    ? styles.statusPlaying
    : pendingRoundCompletion
    ? styles.statusPending
    : styles.statusPaused

  const statusText = isPlaying
    ? '▶ Playing'
    : pendingRoundCompletion
    ? '⏳ Finishing round…'
    : currentRound === 0
    ? '⏸ Start playing to begin'
    : '⏸ Play through the piece'

  return (
    <div className={styles.taskCard}>
      <p className={styles.taskTypeLabel}>Music Piece</p>
      <h2 className={styles.pieceName}>{task.pieceName || 'Untitled Piece'}</h2>

      <div className={styles.roundDisplay}>
        <span className={styles.roundCurrent}>{currentRound}</span>
        <span className={styles.roundSep}>/</span>
        <span className={styles.roundTotal}>{task.rounds}</span>
      </div>
      <p className={styles.roundLabel}>rounds completed</p>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <div className={`${styles.statusBadge} ${statusClass}`}>
        {statusText}
      </div>

      <button className={styles.skipBtn} onClick={onSkip}>
        Skip task
      </button>
    </div>
  )
}
