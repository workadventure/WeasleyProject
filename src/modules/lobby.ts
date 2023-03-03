// Lobby initialisation : must be called in main.ts only
import {PlayerVariableChanged} from "@workadventure/iframe-api-typings/front/Api/Iframe/players";
import {RemotePlayerInterface} from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";
import {UIWebsite} from "@workadventure/iframe-api-typings";

const initiateLobby = async () => {
  // Players tracking
  await WA.players.configureTracking()

  // Receive invitations from other players
  WA.players.onVariableChange('isInviting').subscribe((event: PlayerVariableChanged) => {
    if (event.value === WA.player.uuid) { // Works better than player id, but player MUST be logged
      // TODO : open invitation
      console.log('vous avez été invité par :' + event.player.name)
    }
  })

  // Save user image in variable so other users can get it
  await WA.player.state.saveVariable(
    'playerImage',
    await WA.player.getWokaPicture(),
    {
      public: true
  })

  // Know if user authenticated to prevent others users to invite him
  await WA.player.state.saveVariable(
    'isAuthenticated',
    WA.player.isLogged,
    {
      public: true
  })

  // Watch variable to close website
  WA.player.state.onVariableChange('askForPlayersListWebsiteClose').subscribe((value) => {
    if (value) {
      closePlayersListWebsite()
    }
  })

  // Add button to open players list
  // TODO : save in variable so that can be closed
  // TODo : open and close function so that can be closed in modals
  WA.ui.actionBar.addButton({
    id: 'playerListButton',
    label: 'Joueurs',
    callback: () => {
      if (!playerListWebsiteInstance) {
        openPlayersListWebsite()
      } else {
        closePlayersListWebsite()
      }
    }
  })
}

let playerListWebsiteInstance: UIWebsite|null
const openPlayersListWebsite = async () => {
  playerListWebsiteInstance =  await WA.ui.website.open({
    url: 'http://localhost:5173/views/lobby/playerList.html', // TODO : See how relative path ? --> Make config file with root ?
    allowApi: true,
    allowPolicy: "",
    position: {
      vertical: "middle",
      horizontal: "middle",
    },
    size: {
      height: "50vh",
      width: "50vw",
    },
  })

  WA.player.state.askForPlayersListWebsiteClose = false
}

const closePlayersListWebsite = () => {
    playerListWebsiteInstance?.close()
    playerListWebsiteInstance = null
}

const askForPlayersListWebsiteClose = () => {
  WA.player.state.askForPlayersListWebsiteClose = true
}

// Retrieve a list of all other users
const getPlayersList = async () => {
  await WA.players.configureTracking()
  return WA.players.list()
}

// Know if user can invite player passed in parameter
const canInvitePLayer = (player: RemotePlayerInterface) => {
  // If player has invited someone
  // If player has been invited by someone
  if (player.state.isInviting || player.state.hasBeenInvited) {
    return false
  }
  return true
}

const invitePlayer = (player: RemotePlayerInterface) => {
  WA.player.state.saveVariable("isInviting", player.uuid, {
    public: true,
    persist: true,
    ttl: 24 * 3600,
    scope: "world",
  });
}

export {
  initiateLobby,
  getPlayersList,
  invitePlayer,
  canInvitePLayer,
  closePlayersListWebsite,
  askForPlayersListWebsiteClose
}