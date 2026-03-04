export type TaskType = 'scales' | 'piece'

export interface ScalesTask {
  id: string
  type: 'scales'
  durationMinutes: number
}

export interface PieceTask {
  id: string
  type: 'piece'
  pieceName: string
  rounds: number
}

export type PracticeTask = ScalesTask | PieceTask

export type AppScreen = 'setup' | 'practice' | 'complete'

export interface SessionSummary {
  tasks: PracticeTask[]
  completedAt: number
}
