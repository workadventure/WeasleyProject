import * as utils from '../utils'
import { canUser } from "./job";
import {ActionMessage} from "@workadventure/iframe-api-typings";

// TODO : manage block --> See with get layers boundaries

let findSecretPassageAction: ActionMessage|null = null

const initiateSecretPassages = (
  secretPassagesZones: Array<string> = ['secretPassageZone'],
  callbacks: Array<Function> |null = null
) => {
  if (canUser('findSecretPassages')) {
    // Show all excavation tiles
    for (let i = 0; i < secretPassagesZones.length; i++) {
      // If the excavation has been made before player arrive,
      // we must not show him the excavation trace but we must show him what we found
      if (!WA.state[`${secretPassagesZones[i]}Discovered`]) {
        WA.room.showLayer(`${secretPassagesZones[i]}/trace`)

        WA.room.onEnterLayer(`${secretPassagesZones[i]}/trace`).subscribe(() => {
          if (!WA.state[`${secretPassagesZones[i]}Discovered`]) {
            findSecretPassageAction = WA.ui.displayActionMessage({
              message: utils.translations.translate('utils.executeAction', {
                action: utils.translations.translate('modules.secretPassage.findSecretPassage')
              }),
              callback: () => {
                WA.state[`${secretPassagesZones[i]}Discovered`] = true
              }
            })
          }
        })

        WA.room.onLeaveLayer(`${secretPassagesZones[i]}/trace`).subscribe(() => {
          findSecretPassageAction?.remove()
        })

        WA.state.onVariableChange(`${secretPassagesZones[i]}Discovered`).subscribe(() => {
          findSecretPassage(secretPassagesZones[i], callbacks ? callbacks[i] : null)
        })
      } else {
        WA.room.showLayer(`${secretPassagesZones[i]}/found`)
      }
    }
  }
}

const findSecretPassage = (secretPassageZone: string, callback: Function|null = null) => {
  WA.room.hideLayer(`${secretPassageZone}/trace`)
  WA.room.showLayer(`${secretPassageZone}/search`)

  setTimeout(() => {
    WA.room.showLayer(`${secretPassageZone}/found`)
    setTimeout(() => {
      WA.room.hideLayer(`${secretPassageZone}/search`)

      if (callback) {
        callback()
      }
    }, 1000)
  }, 3000)
}

export {
  initiateSecretPassages,
  findSecretPassage
}