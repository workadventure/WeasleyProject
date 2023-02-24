import * as utils from '../utils'
import { canUser } from "./job";
import {ActionMessage} from "@workadventure/iframe-api-typings";

let makeExcavationAction: ActionMessage|null = null

// initiateExcavationZones
const initiateExcavations = (excavationZones: Array<string> = ['excavationZone'], callbacks : Array<Function>|null = null) => {
  if (canUser('makeExcavation')) {
    // Show all excavation tiles
    for (let i = 0; i < excavationZones.length; i++) {
      // If the excavation has been made before player arrive,
      // we must not show him the excavation trace but we must show him what we found
      if (!WA.state[`${excavationZones[i]}Discovered`]) {
        WA.room.showLayer(`${excavationZones[i]}/trace`)

        WA.room.onEnterLayer(`${excavationZones[i]}/trace`).subscribe(() => {
          if (!WA.state[`${excavationZones[i]}Discovered`]) {
            makeExcavationAction = WA.ui.displayActionMessage({
              message: utils.translations.translate('utils.executeAction', {
                action: utils.translations.translate('modules.excavation.makeExcavations')
              }),
              callback: () => {
                WA.state[`${excavationZones[i]}Discovered`] = true
              }
            })
          }
        })

        WA.room.onLeaveLayer(`${excavationZones[i]}/trace`).subscribe(() => {
          makeExcavationAction?.remove()
        })

        WA.state.onVariableChange(`${excavationZones[i]}Discovered`).subscribe(() => {
          makeExcavations(excavationZones[i], callbacks ? callbacks[i] : null)
        })
      } else {
        WA.room.showLayer(`${excavationZones[i]}/found`)
      }
    }
  }
}

// Make excavation
const makeExcavations = (excavationZone: string, callback: Function|null = null) => {
  WA.room.hideLayer(`${excavationZone}/trace`)
  WA.room.showLayer(`${excavationZone}/search`)

  setTimeout(() => {
    WA.room.showLayer(`${excavationZone}/found`)
    setTimeout(() => {
      WA.room.hideLayer(`${excavationZone}/search`)

      if (callback) {
        callback()
      }
    }, 1000)
  }, 3000)
}

export {
  initiateExcavations,
  makeExcavations
}