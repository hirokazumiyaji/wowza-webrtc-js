/* @flow */

export type Options = {
  video: { bitRate: number, frameRate: string, codec: string },
  audio: { bitRate: number, codec: string },
  peerConnection: { iceServers: Array<any>, iceTransportPolicy: string },
  userData: any
}
