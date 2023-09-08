import {ActionMessage, UIWebsite} from "@workadventure/iframe-api-typings";
import {rootLink} from "./config";
import {initiateJob, getPlayerJob, setPlayerJob} from "./modules/job";
import { actionForAllPlayers, discussion, notifications, secretPassages } from './modules'
import * as utils from './utils'
import {env} from "./config"

let bombWebsite:UIWebsite|null = null
let cheatSheetWebsite:UIWebsite|null = null

WA.onInit().then(() => {

  // Initiate jobs
  initiateJob()

  // FOR DEVELOPMENT PURPOSE ONLY
  if(env === 'dev'){
    setPlayerJob('spy')
  }

  // Speech at arriving
  discussion.openDiscussionWebsite(
    utils.translations.translate('utils.mySelf'),
    utils.translations.translate(`bomb.story.${getPlayerJob()}`),
    'views.choice.close',
    "discussion"
  )


  if (WA.player.state.askForDefuseBomb === undefined) {
    WA.player.state.askForDefuseBomb = false
  }

  if (WA.player.state.askForBoom === undefined) {
    WA.player.state.askForBoom = false
  }

  // Secret passage
  WA.onInit().then(() => {
    // secret passages initialisation
    secretPassages.initiateSecretPassages(
      ['secretPassage'],
      [() => {console.log('secret passage discovered !')}
      ])
  })

  // FREE SPY ACTION
  actionForAllPlayers.initializeActionForAllPlayers('freeSpy', () => {
    utils.layers.toggleLayersVisibility('rock', false)

    if (getPlayerJob() === 'spy') {
      WA.player.removeOutlineColor()
      WA.controls.restorePlayerControls()
    }
  })

  // BOMB EXPLODES ACTION
  actionForAllPlayers.initializeActionForAllPlayers('boom', () => {
      discussion.openDiscussionWebsite(
        utils.translations.translate('bomb.bomb.failure.name'),
        utils.translations.translate('bomb.bomb.failure.message'),
        'views.choice.close',
        "discussion"
      )
    })

  // DEFUSE BOMB ACTION
  actionForAllPlayers.initializeActionForAllPlayers('defuseBomb', () => {
    utils.layers.toggleLayersVisibility('bomb', false)
    closeBombWebsite()
    notifications.notify(
      utils.translations.translate('bomb.success'),
      utils.translations.translate('utils.success'),
      'success'
    )
  })

  if (getPlayerJob() === 'spy') {
    // Can see cheatSheet
    WA.ui.actionBar.addButton({
      id: 'cheatSheetButton',
      label: utils.translations.translate('bomb.cheatSheet'),
      callback: async () => {
        if (!cheatSheetWebsite) {
          await openCheatSheetWebsite()
        } else {
          closeCheatSheetWebsite()
        }
      }
    });
  }

  if (!actionForAllPlayers.hasBeenTriggered('freeSpy')) {
    if (getPlayerJob() === 'spy') {
      // Is blocked under a rock
      WA.player.setOutlineColor(255, 0, 0)
      WA.controls.disablePlayerControls()
    }
  } else {
    utils.layers.toggleLayersVisibility('rock', false)
  }

  // On enter free spy layer
  let displayFreeSpyActionMessage: ActionMessage | null = null
  WA.room.onEnterLayer('saveSpyZone').subscribe(() => {
    // If bomb has not been defused, cannot free spy
    if (!actionForAllPlayers.hasBeenTriggered('boom') && !actionForAllPlayers.hasBeenTriggered('defuseBomb')) {
      discussion.openDiscussionWebsite(
        utils.translations.translate('utils.mySelf'),
        utils.translations.translate('bomb.freeSpy.noTime'),
        'views.choice.close',
        "discussion"
      )
    } else if(!actionForAllPlayers.hasBeenTrigered('freeSpy')) { // TODO : TEST --> Seems not to work as expected
      displayFreeSpyActionMessage = WA.ui.displayActionMessage({
        message: utils.translations.translate('utils.executeAction', {
          action: utils.translations.translate('bomb.freeSpy.free')
        }),
        callback: () => {
          actionForAllPlayers.activateActionForAllPlayer('freeSpy')
        }
      })

      WA.room.onLeaveLayer('saveSpyZone').subscribe(() => {
        displayFreeSpyActionMessage?.remove()
        displayFreeSpyActionMessage = null
      })
    }
  })

  // On enter bomb layer
  let displayDefuseBombActionMessage: ActionMessage | null = null
  WA.room.onEnterLayer('bombZone').subscribe( () => {
    if (!actionForAllPlayers.hasBeenTriggered('boom') && !actionForAllPlayers.hasBeenTriggered('defuseBomb')) {
      displayDefuseBombActionMessage = WA.ui.displayActionMessage({
        message: utils.translations.translate('utils.executeAction', {
          action: utils.translations.translate('bomb.bomb.defuse')
        }),
        callback: async () => {
          WA.controls.disablePlayerControls();

          // Open card
          bombWebsite = await WA.ui.website.open({
            url: `${rootLink}/views/bomb/bomb.html`,
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
        }
      })
    }

    WA.room.onLeaveLayer('bombZone').subscribe(() => {
      displayDefuseBombActionMessage?.remove()
      displayDefuseBombActionMessage = null
    })
  })

  // Make bomb explosion
  WA.player.state.onVariableChange('askForBoom').subscribe((value) => {
    if (value) {
      closeBombWebsite()
      actionForAllPlayers.activateActionForAllPlayer('boom')
    }
  })

  // Make bomb defusion
  WA.player.state.onVariableChange('askForDefuseBomb').subscribe((value) => {
    if (value) {
      actionForAllPlayers.activateActionForAllPlayer('defuseBomb')
    }
  })
})

const openCheatSheetWebsite = async () => {
  cheatSheetWebsite = await WA.ui.website.open({
    url: `${rootLink}/views/bomb/cheatSheet.html`,
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
}

const closeCheatSheetWebsite = () => {
  cheatSheetWebsite?.close()
  cheatSheetWebsite = null
}

const closeBombWebsite = () => {
  bombWebsite?.close()
  bombWebsite = null
  WA.controls.restorePlayerControls()
}
