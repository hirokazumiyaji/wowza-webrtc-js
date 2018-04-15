/* @flow */
import 'babel-polyfill'
import { type Options } from './options'
import Publisher from './publisher'
import Subscriber from './subscriber'

class Connection {
  constructor(endpoint, applicationName, streamName, sessionId) {
    this.endpoint = endpoint
    this.streamInfo = {
      applicationName: applicationName,
      streamName: streamName,
      sessionId: sessionId
    }
  }

  publisher(options: Options) {
    return new Publisher(this.endpoint, this.streamInfo, options)
  }

  subscriber(options: Options) {
    return new Subscriber(this.endpoint, this.streamInfo, options)
  }
}

export { Connection }
