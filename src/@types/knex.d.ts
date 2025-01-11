// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      password: string
      name: string
      sessionId?: string
    }
    meals: {
      id: string
      userId: string
      name: string
      description: string
      date: Date
      isInTheDiet: boolean
    }
  }
}
