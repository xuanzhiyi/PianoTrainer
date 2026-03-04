import { useState, useRef, useCallback, useEffect } from 'react'
import type { PracticeTask, SessionSummary } from '../types'

interface UsePracticeSessionReturn {
  currentTask: PracticeTask | null
  currentIndex: number
  totalTasks: number
  elapsedSeconds: number
  remainingSeconds: number
  currentRound: number
  onAudioChanged: (isPlaying: boolean) => void
  skipTask: () => void
  isComplete: boolean
  summary: SessionSummary | null
}

export function usePracticeSession(tasks: PracticeTask[]): UsePracticeSessionReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)

  const isPlayingRef = useRef(false)
  const wasPlayingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(currentIndex)
  const elapsedRef = useRef(elapsedSeconds)
  const currentRoundRef = useRef(currentRound)

  currentIndexRef.current = currentIndex
  elapsedRef.current = elapsedSeconds
  currentRoundRef.current = currentRound

  const currentTask = isComplete ? null : (tasks[currentIndex] ?? null)

  const totalSeconds =
    currentTask?.type === 'scales' ? currentTask.durationMinutes * 60 : 0
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

  const advanceTask = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    const nextIndex = currentIndexRef.current + 1
    if (nextIndex >= tasks.length) {
      setIsComplete(true)
      setSummary({ tasks, completedAt: Date.now() })
    } else {
      setCurrentIndex(nextIndex)
      setElapsedSeconds(0)
      setCurrentRound(0)
    }
  }, [tasks])

  // Start the scales timer whenever isPlaying is true and task is scales
  const startScalesTimer = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      const task = tasks[currentIndexRef.current]
      if (!task || task.type !== 'scales') return
      const next = elapsedRef.current + 1
      setElapsedSeconds(next)
      if (next >= task.durationMinutes * 60) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        advanceTask()
      }
    }, 1000)
  }, [tasks, advanceTask])

  const stopScalesTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onAudioChanged = useCallback(
    (isPlaying: boolean) => {
      const task = tasks[currentIndexRef.current]
      if (!task) return

      isPlayingRef.current = isPlaying

      if (task.type === 'scales') {
        if (isPlaying) {
          startScalesTimer()
        } else {
          stopScalesTimer()
        }
      } else if (task.type === 'piece') {
        if (!isPlaying && wasPlayingRef.current) {
          // User just stopped — wait 1 s of silence to confirm stop
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = setTimeout(() => {
            // Still silent after 1 s: count as a completed round
            const nextRound = currentRoundRef.current + 1
            setCurrentRound(nextRound)
            if (nextRound >= (tasks[currentIndexRef.current] as { rounds: number }).rounds) {
              advanceTask()
            }
          }, 1000)
        } else if (isPlaying && silenceTimerRef.current) {
          // User started playing again before silence timer fired — cancel it
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
        wasPlayingRef.current = isPlaying
      }
    },
    [tasks, startScalesTimer, stopScalesTimer, advanceTask]
  )

  const skipTask = useCallback(() => {
    advanceTask()
  }, [advanceTask])

  // Reset task-local state when currentIndex changes
  useEffect(() => {
    setElapsedSeconds(0)
    setCurrentRound(0)
    wasPlayingRef.current = false
  }, [currentIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  return {
    currentTask,
    currentIndex,
    totalTasks: tasks.length,
    elapsedSeconds,
    remainingSeconds,
    currentRound,
    onAudioChanged,
    skipTask,
    isComplete,
    summary,
  }
}
