import { useState, useRef, useCallback, useEffect } from 'react'

const PLAY_THRESHOLD = 12
const POLL_INTERVAL_MS = 80

type PermissionState = 'idle' | 'granted' | 'denied' | 'error'

interface UseAudioDetectorReturn {
  isSupported: boolean
  permissionState: PermissionState
  volume: number
  isPlaying: boolean
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
}

export function useAudioDetector(): UseAudioDetectorReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle')
  const [volume, setVolume] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    setVolume(0)
    setIsPlaying(false)
  }, [])

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Microphone access is not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)

      intervalRef.current = setInterval(() => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(data)
        const avg = data.reduce((sum, v) => sum + v, 0) / data.length
        const normalized = Math.min(100, (avg / 128) * 100)
        setVolume(normalized)
        setIsPlaying(normalized > PLAY_THRESHOLD)
      }, POLL_INTERVAL_MS)

      setPermissionState('granted')
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionState('denied')
        setError('Microphone permission was denied.')
      } else {
        setPermissionState('error')
        setError('Could not access microphone.')
      }
    }
  }, [isSupported])

  useEffect(() => {
    return () => stopListening()
  }, [stopListening])

  return {
    isSupported,
    permissionState,
    volume,
    isPlaying,
    error,
    startListening,
    stopListening,
  }
}
