// TODO : see if we can lock the camera to see the full room (see all users to listen to variables of all users)

// LOBBY INITIALISATION
import {PlayerVariableChanged} from "@workadventure/iframe-api-typings/front/Api/Iframe/players";
import {RemotePlayerInterface} from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";


let invitedPlayer: RemotePlayerInterface|undefined
let invitedByPlayer: RemotePlayerInterface|undefined

WA.onInit().then(async () => {
  // Authorize player tracking to watch variables
  await WA.players.configureTracking();
})

const initiateLobby = async () => {

  console.log('LOBBY INITIALISATION')

  // Send invitation to remote players
  WA.ui.onRemotePlayerClicked.subscribe((remotePlayer) => {
    console.log('clicked', remotePlayer.state.hasBeenInvited) // TODO : WOKA détecte pas à chaque fois que tu as cliqué sur l'user alors que pourtant, il affiche "bloquer l"user"
    // If player hasn't already been invited
    if (!remotePlayer.state.hasBeenInvited) {

      // Invite player --> TODO : translations
      remotePlayer.addAction('Inviter le joueur', () => {
        console.log('Vous avez invité le joueur : ', remotePlayer.name);
        WA.player.state.saveVariable(
          'isInviting',
          remotePlayer.playerId, {
            public: true
          })

        invitedPlayer = remotePlayer

        // Open website for awaiting acceptation
        openAwaitForAcceptationWebsite()
      });
    }
  })

  // receive invitation from remote players
  WA.players.onVariableChange('isInviting').subscribe((event: PlayerVariableChanged) => {
    if (event.value === WA.player.playerId) {
      console.log('Vous avez reçu une invitation de ' + event.player.name)

      // Save player that invited you
      invitedByPlayer = event.player
      WA.player.state.saveVariable(
        'hasBeenInvited',
          event.player.playerId, {
          public: true
        })

      // Open website to accept or not invitation
      openAcceptInviteWebsite()
    }
  })

  // Receive invitation cancellation from remote player --> TODO : see how with undefined or not
}

const openAwaitForAcceptationWebsite = () => {
  // TODO : disable control and open website
  console.log('TODO : Open website with cancel button and loading')
}

const openAcceptInviteWebsite = () => {
  // TODO : disable control and open website
  console.log('TODO : Open website with playerId in query url')
}

const onAcceptInvitation = () => {
  // TODO : close website + timer ?
  console.log('TODO : User accepted invitation')
}

const onRefuseInvitation = () => {
  // TODO : re-enable controls and close website
  console.log('TODO : User refused invitation')
}

const onCancelInvitation = () => {
  // TODO : re-enable controls and close website
  console.log('TODO : User cancelled invitation')

  // Reset invited player variable
  invitedPlayer = undefined
  WA.player.state.saveVariable(
    'hasBeenInvited',
    null, {
      public: true
    })
}

export {
  initiateLobby,
  onAcceptInvitation,
  onCancelInvitation,
  onRefuseInvitation,
  openAcceptInviteWebsite,
  openAwaitForAcceptationWebsite
}