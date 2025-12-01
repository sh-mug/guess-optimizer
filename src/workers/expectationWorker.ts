/// <reference lib="webworker" />

import { handleRequest, type WorkerRequest } from './handler'

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const response = handleRequest(event.data)
  self.postMessage(response)
}
