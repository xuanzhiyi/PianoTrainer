import type { PieceTask } from '../../types'
import styles from './TaskView.module.css'

interface PieceTaskViewProps {
  task: PieceTask
  currentRound: number
  isPlaying: boolean
  onSkip: () => void
}

export function PieceTaskView({ task, currentRound, isPlaying, onSkip }: PieceTaskViewProps) {
  const progress = task.rounds > 0 ? currentRound / task.rounds : 0

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

      <div className={`${styles.statusBadge} ${isPlaying ? styles.statusPlaying : styles.statusPaused}`}>
        {isPlaying
          ? '▶ Playing'
          : currentRound === 0
          ? '⏸ Start playing to begin'
          : '⏸ Stop playing to complete a round'}
      </div>

      <button className={styles.skipBtn} onClick={onSkip}>
        Skip task
      </button>
    </div>
  )
}
