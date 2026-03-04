import { useState } from 'react'
import type { PracticeTask } from '../../types'
import { TaskConfigurator } from './TaskConfigurator'
import styles from './SessionSetup.module.css'

interface SessionSetupProps {
  onStart: (tasks: PracticeTask[]) => void
}

let idCounter = 0
const nextId = () => `task-${++idCounter}`

export function SessionSetup({ onStart }: SessionSetupProps) {
  const [tasks, setTasks] = useState<PracticeTask[]>([])

  const addScales = () =>
    setTasks((prev) => [...prev, { id: nextId(), type: 'scales', durationMinutes: 5 }])

  const addPiece = () =>
    setTasks((prev) => [
      ...prev,
      { id: nextId(), type: 'piece', pieceName: '', rounds: 3 },
    ])

  const updateTask = (index: number, updated: PracticeTask) =>
    setTasks((prev) => prev.map((t, i) => (i === index ? updated : t)))

  const removeTask = (index: number) =>
    setTasks((prev) => prev.filter((_, i) => i !== index))

  const canStart = tasks.length > 0

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Piano Trainer</h1>
        <p className={styles.subtitle}>Build your practice session</p>
      </header>

      {tasks.length === 0 && (
        <div className={styles.emptyState}>
          <p>No tasks yet. Add a task below to get started.</p>
        </div>
      )}

      <div className={styles.taskList}>
        {tasks.map((task, i) => (
          <TaskConfigurator
            key={task.id}
            task={task}
            index={i}
            onChange={(updated) => updateTask(i, updated)}
            onRemove={() => removeTask(i)}
          />
        ))}
      </div>

      <div className={styles.addButtons}>
        <button className={styles.addBtn} onClick={addScales}>
          + Scales
        </button>
        <button className={styles.addBtn} onClick={addPiece}>
          + Music Piece
        </button>
      </div>

      <button
        className={styles.startBtn}
        onClick={() => onStart(tasks)}
        disabled={!canStart}
      >
        Start Session
      </button>
    </div>
  )
}
