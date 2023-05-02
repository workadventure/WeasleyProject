import * as utils from '../utils'
import { canUser } from "./job";
import {ActionMessage} from "@workadventure/iframe-api-typings";

let findSecretPassageAction: ActionMessage|null = null

const removeBlocksTiles = (zone: string) => {
  const mapWidth = WA.state.mapWidth as number
  const mapHeight = WA.state.mapHeight as number
  const tiles = []
  for (let i = 1; i < mapWidth; i++) {
    for (let j = 1; j < mapHeight; j++) {
      tiles.push({ x: i, y: j, tile: null, layer: `${zone}/block` });
    }
  }

  WA.room.setTiles(tiles)
}

const initiateSecretPassages = (
  secretPassagesZones: Array<string> = ['secretPassageZone'],
  callbacks: Array<Function> |null = null
) => {

    // Show all secret passages tiles
    for (let i = 0; i < secretPassagesZones.length; i++) {
      // If the secret passage has been discovered before player arrive,
      // we must not show him the secret passage trace but we must show him what we found
      if (!WA.state[`${secretPassagesZones[i]}Discovered`]) {
        if (canUser('findSecretPassages')) {
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
        } else {
          // These layers should already have been hidden from the map, but we hide them anyway (in case map builder forgot)
          WA.room.hideLayer(`${secretPassagesZones[i]}/trace`)
          WA.room.hideLayer(`${secretPassagesZones[i]}/found`)
          WA.room.hideLayer(`${secretPassagesZones[i]}/disappear`)
        }

        WA.state.onVariableChange(`${secretPassagesZones[i]}Discovered`).subscribe(() => {
          findSecretPassage(secretPassagesZones[i], callbacks ? callbacks[i] : null)
        })
      } else {
        // This layer should already have been hidden but we hide in case map builder forgot
        WA.room.hideLayer(`${secretPassagesZones[i]}/trace`)

        WA.room.showLayer(`${secretPassagesZones[i]}/found`)
        WA.room.hideLayer(`${secretPassagesZones[i]}/disappear`)
      }
    }
}

const findSecretPassage = (secretPassageZone: string, callback: Function|null = null) => {
  WA.room.hideLayer(`${secretPassageZone}/trace`)
  WA.room.showLayer(`${secretPassageZone}/search`)

  setTimeout(() => {
    WA.room.showLayer(`${secretPassageZone}/found`)
    WA.room.hideLayer(`${secretPassageZone}/disappear`)
    removeBlocksTiles(secretPassageZone)

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
  findSecretPassage,
  removeBlocksTiles
}