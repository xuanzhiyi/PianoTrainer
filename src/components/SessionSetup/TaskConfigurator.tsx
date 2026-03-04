import type { PracticeTask, ScalesTask, PieceTask } from '../../types'
import styles from './TaskConfigurator.module.css'

interface TaskConfiguratorProps {
  task: PracticeTask
  index: number
  onChange: (updated: PracticeTask) => void
  onRemove: () => void
}

export function TaskConfigurator({ task, index, onChange, onRemove }: TaskConfiguratorProps) {
  if (task.type === 'scales') {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.taskNumber}>{index + 1}</span>
          <span className={styles.taskType}>Scales Practice</span>
          <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove task">
            ✕
          </button>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Duration (minutes)</label>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={(task as ScalesTask).durationMinutes}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              onChange({ ...task, durationMinutes: Math.max(1, Number(e.target.value)) })
            }
          />
        </div>
      </div>
    )
  }

  if (task.type === 'piece') {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.taskNumber}>{index + 1}</span>
          <span className={styles.taskType}>Music Piece</span>
          <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove task">
            ✕
          </button>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Piece name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Für Elise"
            value={(task as PieceTask).pieceName}
            onChange={(e) => onChange({ ...task, pieceName: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Number of rounds</label>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={(task as PieceTask).rounds}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              onChange({ ...task, rounds: Math.max(1, Number(e.target.value)) })
            }
          />
        </div>
      </div>
    )
  }

  return null
}
