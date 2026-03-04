import { useEffect } from 'react'
import type { PracticeTask, SessionSummary } from '../../types'
import { useAudioDetector } from '../../hooks/useAudioDetector'
import { usePracticeSession } from '../../hooks/usePracticeSession'
import { AudioIndicator } from '../AudioIndicator/AudioIndicator'
import { ScalesTaskView } from './ScalesTaskView'
import { PieceTaskView } from './PieceTaskView'
import styles from './PracticeSession.module.css'

interface PracticeSessionProps {
  tasks: PracticeTask[]
  onComplete: (summary: SessionSummary) => void
}

export function PracticeSession({ tasks, onComplete }: PracticeSessionProps) {
  const audio = useAudioDetector()
  const session = usePracticeSession(tasks)

  // Request mic on mount
  useEffect(() => {
    audio.startListening()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Feed audio changes into session logic
  useEffect(() => {
    session.onAudioChanged(audio.isPlaying)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.isPlaying])

  // Session completion
  useEffect(() => {
    if (session.isComplete && session.summary) {
      onComplete(session.summary)
    }
  }, [session.isComplete, session.summary, onComplete])

  const { currentTask, currentIndex, totalTasks } = session

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.progress}>
          Task {currentIndex + 1} of {totalTasks}
        </span>
        <AudioIndicator
          volume={audio.volume}
          isPlaying={audio.isPlaying}
          permissionState={audio.permissionState}
          error={audio.error}
        />
      </header>

      <div className={styles.taskArea}>
        {currentTask?.type === 'scales' && (
          <ScalesTaskView
            task={currentTask}
            elapsedSeconds={session.elapsedSeconds}
            remainingSeconds={session.remainingSeconds}
            isPlaying={audio.isPlaying}
            onSkip={session.skipTask}
          />
        )}
        {currentTask?.type === 'piece' && (
          <PieceTaskView
            task={currentTask}
            currentRound={session.currentRound}
            isPlaying={audio.isPlaying}
            onSkip={session.skipTask}
          />
        )}
      </div>
    </div>
  )
}
