/* @flow */
/* eslint no-console: "off" */
const Logger = {
  debug: (label: string, message: any) => {
    console.group(label)
    console.debug(message)
    console.groupEnd()
  },
  info: (label: string, message: any) => {
    console.group(label)
    console.info(message)
    console.groupEnd()
  },
  warn: (label: string, message: any) => {
    console.group(label)
    console.warn(message)
    console.groupEnd()
  },
  error: (label: string, message: any) => {
    console.group(label)
    console.error(message)
    console.groupEnd()
  }
}

export default Logger
