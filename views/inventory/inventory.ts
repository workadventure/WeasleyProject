/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />

import * as utils from '../../src/utils/index.js'
import * as modules from '../../src/modules/index.js'

document.addEventListener("DOMContentLoaded", () => {
  WA.onInit().then(async () => {
    // Get html parts
    const inventoryContent = document.getElementById('inventoryContent')
    const closeWebsiteInventoryButton = document.getElementById('closeButton')

    // Inventory content
    if (inventoryContent) {
      const inventory = modules.inventory.getInventory()
      const maxSize = modules.inventory.getMaxSize()

      for (let i = 0; i < maxSize; i++) {
        const item = document.createElement('div')

        if (inventory[i]) {
          item.innerText = inventory[i].name
        } else {
          item.innerText = 'rien'
        }
        inventoryContent.appendChild(item)
      }
    }

    if (closeWebsiteInventoryButton) {
      closeWebsiteInventoryButton.innerText = 'coucou' // TODO : translation
      closeWebsiteInventoryButton.addEventListener('click', () => {
        modules.inventory.askForCloseInventory()
      })
    }
  }).catch(e => console.error(e))
})

export {}