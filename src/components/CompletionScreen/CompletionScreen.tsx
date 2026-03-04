import type { SessionSummary, PracticeTask } from '../../types'
import styles from './CompletionScreen.module.css'

interface CompletionScreenProps {
  summary: SessionSummary
  onNewSession: () => void
}

function taskLabel(task: PracticeTask): string {
  if (task.type === 'scales') {
    return `Scales — ${task.durationMinutes} min`
  }
  if (task.type === 'piece') {
    return `${task.pieceName || 'Untitled Piece'} — ${task.rounds} round${task.rounds !== 1 ? 's' : ''}`
  }
  return 'Unknown task'
}

export function CompletionScreen({ summary, onNewSession }: CompletionScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.icon}>🎹</div>
        <h1 className={styles.title}>Practice Complete!</h1>
        <p className={styles.subtitle}>Great work. Here's what you accomplished:</p>
      </div>

      <ul className={styles.taskList}>
        {summary.tasks.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            <span className={styles.checkmark}>✓</span>
            <span>{taskLabel(task)}</span>
          </li>
        ))}
      </ul>

      <button className={styles.newSessionBtn} onClick={onNewSession}>
        New Session
      </button>
    </div>
  )
}
