/* @flow */

const Logger = {
  write: (label: string, message: object) => {
    console.group(label)
    console.log(message)
    console.groupEnd()
  }
}

export default Logger
