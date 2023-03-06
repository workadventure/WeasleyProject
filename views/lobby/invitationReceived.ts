/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as modules from '../../src/modules/index.js'

const getInvitorName = () => {
  return 'TEST'
}

const refuseInvitation = () => {
  modules.lobby.askForCloseInvitationWebsite()
}

const acceptInvitation = () => {
  modules.lobby.acceptInvitation()
}

export {
  refuseInvitation,
  acceptInvitation,
  getInvitorName
}