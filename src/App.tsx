import { useState } from 'react'
import type { PracticeTask, AppScreen, SessionSummary } from './types'
import { SessionSetup } from './components/SessionSetup/SessionSetup'
import { PracticeSession } from './components/PracticeSession/PracticeSession'
import { CompletionScreen } from './components/CompletionScreen/CompletionScreen'
import styles from './App.module.css'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('setup')
  const [tasks, setTasks] = useState<PracticeTask[]>([])
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const handleStart = (selectedTasks: PracticeTask[]) => {
    setTasks(selectedTasks)
    setScreen('practice')
  }

  const handleComplete = (sessionSummary: SessionSummary) => {
    setSummary(sessionSummary)
    setScreen('complete')
  }

  const handleNewSession = () => {
    setTasks([])
    setSummary(null)
    setScreen('setup')
  }

  return (
    <div className={styles.app}>
      {screen === 'setup' && <SessionSetup onStart={handleStart} />}
      {screen === 'practice' && (
        <PracticeSession tasks={tasks} onComplete={handleComplete} />
      )}
      {screen === 'complete' && summary && (
        <CompletionScreen summary={summary} onNewSession={handleNewSession} />
      )}
    </div>
  )
}
