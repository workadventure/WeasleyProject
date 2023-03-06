/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as modules from '../../src/modules/index.js'
import {RemotePlayerInterface} from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";

// Generate players list
const generatePlayersListButtons = async (element: HTMLElement) => {
    // user is not authenticated
    if (!WA.player.isLogged) {
      const div = document.createElement('div')
      div.innerText = 'Connectez-vous pour pouvoir inviter quelqu\'un' // TODO : translate
      div.classList.add('alert')
      div.classList.add('error')
      div.classList.add('mb-2')
      element.prepend(div)
    }

    // set player list
    const players = await modules.lobby.getPlayersList()

    console.log('players', players)

    for (let player of players) {
      console.log('player', players)
      element.appendChild(getPlayerButton(player))
    }
}

// One item in players list
const getPlayerButton = (player: RemotePlayerInterface) => {
  let child = document.createElement('div')
  child.classList.add('player-line')

  let image = document.createElement('img')
  image.setAttribute('src', player.state.playerImage as string)

  let name = document.createElement('span')
  name.innerText = player.name

  let button:HTMLElement

  // User cannot invite unAuthenticated users
  if (player.state.isAuthenticated) {
    button = document.createElement('button')
    button.innerText = 'Inviter' // TODO : Translations
    button.classList.add('btn')
    button.classList.add('bg-info')

    // Cannot invite players if is not authenticated
    if (!WA.player.isLogged) {
      button.classList.add('bg-error')
      button.setAttribute('disabled', '1')
    } else {
      button.classList.add('bg-info')
    }
  } else {
    button = document.createElement('div')
    button.innerText = 'Not authenticated' // TODO : translations
    button.classList.add('error')
  }

  button.addEventListener("click", () => {
    console.log("Tentative d'inviter " + player.name + ' : ' + player.playerId)
    // TODO : if can be invited (has not invited someone + is not invited by someone else)
    // TODO : OU on laisse plusieurs users pouvoir inviter le même user ?
    modules.lobby.invitePlayer(player)
    /*if (modules.lobby.canInvitePLayer(player)) {
      modules.lobby.invitePlayer(player)
    } else {
      // TODO : Toast website open ? or WOKA BANNER
      console.log('Player is not available') // TODO : translations
    }*/
  })

  // Cannot invite player if he has already been invited or has already invited someone
  // TODO : player can be invited function (dans lobby.ts)
  if (player.state.hasBeenInvited) {
    button.setAttribute('disabled', 'disabled')
  }

  child.appendChild(image)
  child.appendChild(name)
  child.appendChild(button)

  return child
}

// Close website
const closePlayersListWebsite = () => {
  modules.lobby.askForPlayersListWebsiteClose()
}

export {
  generatePlayersListButtons,
  getPlayerButton,
  closePlayersListWebsite,
}