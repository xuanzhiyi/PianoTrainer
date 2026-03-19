import { useState, useRef, useCallback, useEffect } from 'react'
import type { PracticeTask, SessionSummary } from '../types'

// How long the user must be silent before a piece round is counted complete
const SILENCE_TO_COMPLETE_MS = 4000
// Minimum continuous play time before silence can trigger a round completion
const MIN_PLAY_MS = 2000

interface UsePracticeSessionReturn {
  currentTask: PracticeTask | null
  currentIndex: number
  totalTasks: number
  elapsedSeconds: number
  remainingSeconds: number
  currentRound: number
  pendingRoundCompletion: boolean
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
  const [pendingRoundCompletion, setPendingRoundCompletion] = useState(false)

  const isPlayingRef = useRef(false)
  const wasPlayingRef = useRef(false)
  const playStartTimeRef = useRef<number | null>(null)
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
    setPendingRoundCompletion(false)
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
        if (isPlaying) {
          // Track when playing started (only set on fresh start, not continuation)
          if (!wasPlayingRef.current) {
            playStartTimeRef.current = Date.now()
          }
          // User resumed playing — cancel any pending round completion
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
            setPendingRoundCompletion(false)
          }
        } else if (!isPlaying && wasPlayingRef.current) {
          // User just stopped — only start the silence timer if they played long enough
          const playDuration = playStartTimeRef.current
            ? Date.now() - playStartTimeRef.current
            : 0
          if (playDuration >= MIN_PLAY_MS) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
            setPendingRoundCompletion(true)
            silenceTimerRef.current = setTimeout(() => {
              setPendingRoundCompletion(false)
              playStartTimeRef.current = null
              const nextRound = currentRoundRef.current + 1
              setCurrentRound(nextRound)
              if (nextRound >= (tasks[currentIndexRef.current] as { rounds: number }).rounds) {
                advanceTask()
              }
            }, SILENCE_TO_COMPLETE_MS)
          }
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
    setPendingRoundCompletion(false)
    wasPlayingRef.current = false
    playStartTimeRef.current = null
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
    pendingRoundCompletion,
    onAudioChanged,
    skipTask,
    isComplete,
    summary,
  }
}

