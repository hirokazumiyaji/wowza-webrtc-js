/* @flow */
import logger from './logger'
import { type StreamInfo } from './streamInfo'
import { type Options } from './options'

const RTCPeerConnection = window.RTCPeerConnection
const RTCIceCandidate = window.RTCIceCandidate
const RTCSessionDescription = window.RTCSessionDescription

export default class Subscriber {
  constructor(endpoint: string, streamInfo: StreamInfo, options: Options) {
    this.stream = null
    this.ws = null
    this.pc = null
    this.repeaterRetryCount = 0
    this.endpoint = endpoint
    this.streamInfo = streamInfo
    this.userData = {
      sessionId: streamInfo.sessionId
    }
    this.peerConnectionConfig = {
      iceServers: []
    }
    if (options) {
      if (options.userData) {
        this.userData = { ...this.userData, ...options.userData }
      }
      if (options.peerConnection) {
        this.peerConnectionConfig = {
          ...this.peerConnectionConfig,
          ...options.peerConnection
        }
      }
    }
  }

  connect() {
    return this.disconnect()
      .then(() => {
        this.pc = new RTCPeerConnection(this.peerConnectionConfig)
        this.pc.onicecandidate = event => {
          logger.info('ON ICE CANDIDATE', event)
        }
        if (typeof this.pc.ontrack === 'undefined') {
          this.pc.onaddstream = function (event) {
            logger.info('ON ADD STREAM', event)
            this.stream = event.stream
          }.bind(this)
        } else {
          this.pc.ontrack = function (event) {
            logger.info('ON TRACK', event)
            this.stream = event.streams[0]
          }.bind(this)
        }
        return Promise.resolve()
      })
      .then(this.connectWebSocket.bind(this))
      .then(() => {
        logger.info('FINISH', this.stream)
        return this.stream
      })
  }

  disconnect() {
    logger.info('DISCONNECT', '')
    const closeStream = new Promise((resolve, _) => {
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop()
        })
      }
      this.stream = null
      return resolve()
    })
    const closePeerConnection = new Promise((resolve, _) => {
      if (this.pc) {
        this.pc.close()
      }
      this.pc = null
      return resolve()
    })
    const closeWebSocket = new Promise((resolve, _) => {
      if (this.ws) {
        this.ws.close()
      }
      this.ws = null
      return resolve()
    })
    return Promise.all([closeStream, closePeerConnection, closeWebSocket])
  }

  connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint)
      this.ws.binaryType = 'arraybuffer'
      this.ws.onopen = () => {
        logger.info('WEBSOCKET ON OPEN', '')
        this.sendPlayMessage()
      }
      this.ws.onmessage = async event => {
        logger.info('WEBSOCKET ON MESSAGE', event)
        const data = JSON.parse(event.data)
        const status = Number(data.status)
        const command = data.command
        if (status === 514) {
          this.repeaterRetryCount++
          if (this.repeaterRetryCount < 10) {
            logger.error('ERROR RESPONSE', data)
          } else {
            await this.disconnect()
            const error = new Error()
            error.message = 'repeater retry fail'
            return reject(error)
          }
        } else if (status !== 200) {
          await this.disconnect()
          return reject(data)
        } else {
          if (data.streamInfo !== undefined) {
            this.streamInfo.sessionId = data.streamInfo.sessionId
          }
          if (data.sdp !== undefined) {
            this.setRemoteDescription(data)
              .then(() => {
                return this.pc.createAnswer()
                  .then(description => this.setLocalDescription(description))
              })
              .then(this.sendAnswer.bind(this))
          }
          this.addIceCandidates(data)
        }
        if ('sendResponse'.localeCompare(command) === 0) {
          if (this.ws !== null) {
            this.ws.close()
            this.ws = null
          }
          resolve()
        }
        if ('getAvailableStreams'.localeCompare(command) === 0) {
          await this.disconnect()
        }
      }
      this.ws.onclose = () => {
        logger.info('WEBSOCKET ON CLOSE', '')
      }
      this.ws.onerror = async event => {
        logger.error('WEBSOCKET ON ERROR', event)
        await this.disconnect()
        reject(event)
      }
    })
  }

  addIceCandidates(data: any) {
    logger.info('ADD ICE CANDIDATES', data)
    if (data.iceCandidates !== undefined) {
      data.iceCandidates.forEach(iceCandidate => {
        this.pc.addIceCandidate(new RTCIceCandidate(iceCandidate))
      })
    }
  }

  setLocalDescription(description: RTCSessionDescription.prototype) {
    logger.info('SET LOCAL DESCRIPTION', description)
    return this.pc.setLocalDescription(description)
      .then(() => description)
  }

  setRemoteDescription(description: any) {
    return this.pc.setRemoteDescription(
      new RTCSessionDescription(description.sdp)
    )
  }

  sendPlayMessage() {
    this.ws.send(
      JSON.stringify({
        direction: 'play',
        command: 'getOffer',
        streamInfo: this.streamInfo,
        userData: this.userData
      })
    )
    return Promise.resolve()
  }

  sendGetAvailableStreams() {
    this.ws.send(
      JSON.stringify({
        direction: 'play',
        command: 'getAvailableStreams',
        streamInfo: this.streamInfo,
        userData: this.userData
      })
    )
    return Promise.resolve()
  }

  sendAnswer(description: any) {
    logger.info('SEND ANSWER', description)
    this.ws.send(
      JSON.stringify({
        direction: 'play',
        command: 'sendResponse',
        streamInfo: this.streamInfo,
        sdp: description
      })
    )
    return Promise.resolve()
  }
}
