import { readRunes, inventory, switchingTiles, actionForAllPlayers, discussion } from './modules'
import * as utils from './utils'
import {ActionMessage} from "@workadventure/iframe-api-typings";

WA.onInit().then(() => {
  // Inventory initialisation
  inventory.initiateInventory()

  // Runes reading initialisation
  readRunes.initiateRunesReading()
  readRunes.setRunesReadingZone('runesReading', {content : 'treasureEnigma.runes.content'})

  // Satues enigma setup
  let canTakeHammerActionMessage: ActionMessage | null = null
  switchingTiles.setSwitchingTile(
    'rotatingStatues',
    () => {
      utils.layers.toggleLayersVisibility('hammerZoneTop', false)
      WA.room.onEnterLayer('hammerZone').subscribe(() => {
        if (!inventory.hasItem('hammer')) {
          canTakeHammerActionMessage = WA.ui.displayActionMessage({
            message: utils.translations.translate('utils.executeAction', {
              action: utils.translations.translate('treasureEnigma.hammer.action')
            }),
            callback: () => {
              inventory.addToInventory({
                id: 'hammer',
                name: 'treasureEnigma.hammer.name',
                image: 'hammer.png',
                description: 'treasureEnigma.hammer.description',
              })
              utils.layers.toggleLayersVisibility('hammerZone', false)
            }
          })
        }
      })

      WA.room.onLeaveLayer('hammerZone').subscribe(() => {
        canTakeHammerActionMessage?.remove()
        canTakeHammerActionMessage = null
      })
    },
    true,
    'treasureEnigma.makeTurn'
  )

  // // HOURGLASSES
  let breakHourglassAction: ActionMessage|null = null

  actionForAllPlayers.initializeRelativeActionForAllPlayers('openTreasureDoor', ['breakHourglass1', 'breakHourglass2'], () => {
    utils.layers.toggleLayersVisibility('torchesOnBottom', true)
    utils.layers.toggleLayersVisibility('torchesOnTop', true)
    utils.layers.toggleLayersVisibility('treasureDoor', false)
  })

  // HOURGLASS 1
  actionForAllPlayers.initializeActionForAllPlayers('breakHourglass1', () => {
    utils.layers.toggleLayersVisibility('hourglass1FullBottom', false)
    utils.layers.toggleLayersVisibility('hourglass1FullTop', false)
    utils.layers.toggleLayersVisibility('hourglass1BrokenTop', true)
    utils.layers.toggleLayersVisibility('hourglass1BrokenBottom', true)
  })

  WA.room.onEnterLayer('breakHourglass1Zone').subscribe(() => {
    if (inventory.hasItem('hammer') && !actionForAllPlayers.hasBeenTriggered('breakHourglass1')) {
      breakHourglassAction = WA.ui.displayActionMessage({
        message: utils.translations.translate('utils.executeAction', {
          action: utils.translations.translate('treasureEnigma.breakHourglass')
        }),
        callback: () => {
          actionForAllPlayers.activateActionForAllPlayer('breakHourglass1')
        }
      })
    }
  })

  WA.room.onLeaveLayer('breakHourglass1Zone').subscribe(() => {
    breakHourglassAction?.remove()
    breakHourglassAction = null
  })

  // HOURGLASS 2
  actionForAllPlayers.initializeActionForAllPlayers('breakHourglass2', () => {
    utils.layers.toggleLayersVisibility('hourglass2FullBottom', false)
    utils.layers.toggleLayersVisibility('hourglass2FullTop', false)
    utils.layers.toggleLayersVisibility('hourglass2BrokenTop', true)
    utils.layers.toggleLayersVisibility('hourglass2BrokenBottom', true)
  })

  WA.room.onEnterLayer('breakHourglass2Zone').subscribe(() => {
    if (inventory.hasItem('hammer') && !actionForAllPlayers.hasBeenTriggered('breakHourglass2')) {
      breakHourglassAction = WA.ui.displayActionMessage({
        message: utils.translations.translate('utils.executeAction', {
          action: utils.translations.translate('treasureEnigma.breakHourglass')
        }),
        callback: () => {
          actionForAllPlayers.activateActionForAllPlayer('breakHourglass2')
        }
      })
    }
  })

  WA.room.onLeaveLayer('breakHourglass2Zone').subscribe(() => {
    breakHourglassAction?.remove()
    breakHourglassAction = null
  })

  // TREASURE ROOM
  actionForAllPlayers.initializeActionForAllPlayers('evilGuyAppears', async () => {
    // Disable player control
    WA.controls.disablePlayerControls()

    WA.camera.set(
      15*32+16,
      4*32+16,
      50,
      50,
      true,
      true,
  )

  // Wait during camera transition
  await utils.main.wait(1000)

  // Bad guy appears
  setTimeout(() => {
    utils.layers.toggleLayersVisibility('badGuy', true)
  }, 300)
  await utils.layers.triggerAnimationWithLayers(['pouf1', 'pouf2', 'pouf3'], 100)

  setTimeout(() => {
    // Bad guy monologue
    discussion.openDiscussionWebsite(
      'treasureEnigma.badGuy.name',
      'treasureEnigma.badGuy.monologue',
      'views.choice.close',
      "discussion",
      "bottom",
      "middle",
      "30vh",
      "100vw",
      () => {
        // Redirect to next map
        WA.nav.goToRoom('./maze.tmj') // TODO changer la map
      }
    )
  }, 300) // Let time to understand what happen
  })

  let treasureActionMessage: ActionMessage|null = null
  WA.room.onEnterLayer('treasure').subscribe(() => {
    treasureActionMessage =WA.ui.displayActionMessage({
      message: utils.translations.translate('utils.executeAction', {
        action: utils.translations.translate('treasureEnigma.takeTheTreasure')
      }),
      callback: () => {
        actionForAllPlayers.activateActionForAllPlayer('evilGuyAppears')
      }
    })
  })

  WA.room.onLeaveLayer('treasure').subscribe(() => {
    treasureActionMessage?.remove()
    treasureActionMessage = null
  })

  // TODO : add blocks for door
})