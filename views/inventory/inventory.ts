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
        item.classList.add('inventory-item')
        item.classList.add('bg-dark')

        if (i !== maxSize - 1) {
          item.classList.add('mr-2')
        }

        if (inventory[i]) {
          item.setAttribute('data-description', inventory[i].description)

          const itemName = document.createElement('div')
          itemName.classList.add('inventory-item-name')
          itemName.classList.add('bg-white')
          itemName.innerText = inventory[i].name

          const itemImageContainer = document.createElement('div')
          const itemImage = document.createElement('img')
          itemImage.setAttribute('src', inventory[i].image)
          itemImage.setAttribute('alt', 'test') // TODO : translations
          itemImageContainer.classList.add('inventory-item-image')

          itemImageContainer.appendChild(itemImage)
          item.appendChild(itemImageContainer)
          item.appendChild(itemName)
        } else {
          const emptyDiv = document.createElement('div')
          emptyDiv.classList.add('position-absolute')
          emptyDiv.classList.add('w-100')
          emptyDiv.classList.add('h-100')
          emptyDiv.classList.add('d-flex')
          emptyDiv.classList.add('align-items-center')
          emptyDiv.classList.add('justify-content-center')
          emptyDiv.innerText = 'Vide' // TODO : translations
          item.appendChild(emptyDiv)
          item.classList.add('empty')
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