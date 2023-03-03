import * as utils from '../utils'
import { canUser } from "./job";
import {ActionMessage} from "@workadventure/iframe-api-typings";
import { findLayerBoundaries, getLayersMap } from '@workadventure/scripting-api-extra'
import {ITiledMapTileLayer} from "@workadventure/tiled-map-type-guard/dist/ITiledMapTileLayer";

let findSecretPassageAction: ActionMessage|null = null

// TODO : remove if useless
/*const getAllLayerTilesCoordinates = async (layerName: string) => {
  const layers = await getLayersMap()
  console.log('Layers', layers)

  const layer = layers.get(layerName) as ITiledMapTileLayer

  console.log('Layer', layer)
  const boundaries = findLayerBoundaries(layer)

}*/

const removeBlocksTiles = (zone: string) => {
  // TODO : we need map dimensions for this : variables in room ?
  // TODO : OR pass array of x and y, but, can't find position of tiles without size of the map...
  const tiles = []
  for (let i = 1; i < 31; i++) {
    for (let j = 1; j < 21; j++) {
      tiles.push({ x: i, y: j, tile: null, layer: `${zone}/block` });
    }
  }

  WA.room.setTiles(tiles)
  console.log('salut')
}

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
        WA.room.hideLayer(`${secretPassagesZones[i]}/disappear`)
      }
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
  findSecretPassage
}