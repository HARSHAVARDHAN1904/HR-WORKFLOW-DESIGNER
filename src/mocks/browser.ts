import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** MSW browser worker — started in main.tsx before React renders. */
export const worker = setupWorker(...handlers)
