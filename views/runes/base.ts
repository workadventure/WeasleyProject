/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as utils from '../../src/utils/index.js'
import * as modules from '../../src/modules/index.js'

document.addEventListener("DOMContentLoaded", () => {
  WA.onInit().then(async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const title = document.getElementById('title')
    const content = document.getElementById('content')
    const closeButton = document.getElementById('closeButton')

    if (title) {
      title.innerText = utils.translations.translate(urlParams.get('title'))
    }

    if (content) {
      content.innerText = utils.translations.translate(urlParams.get('content'))
    }

    if (closeButton) {
      closeButton.innerText = utils.translations.translate('modules.runes.close')
      closeButton.addEventListener('click', () => {
        modules.readRunes.askForRuneWebsiteClosing()
      })
    }
  })
})

export {}