import { readRunes, inventory, switchingTiles, actionForAllPlayers } from './modules'
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
              action: 'Prndre le marteau' // TODO : translations
            }),
            callback: () => {
              inventory.addToInventory({
                id: 'hammer',
                name: 'Marteau',
                image: 'hammer.png',
                description: 'Je dois bien pouvoir en faire quelque chose...',
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
    'my.action.translation.key' // translation key of the action message displayed // TODO
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
          action: 'Briser le sablier' // TODO: translation
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
          action: 'Briser le sablier' // TODO: translation
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
})