/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as modules from '../../src/modules/index.js'

const cancelInvitation = () => {
  console.log('modules.lobby.askforcancelinvitation')
  modules.lobby.askForCancelInvitation()
}

export {
  cancelInvitation
}