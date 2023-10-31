/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as utils from '../../src/utils/index.js'

document.addEventListener("DOMContentLoaded", () => {
  WA.onInit().then(async () => {
    const picture = document.getElementById('picture')
    const title = document.getElementById('title')
    const content = document.getElementById('content')
    const date = document.getElementById('date')

    if (content) {
      content.innerText = utils.translations.translate('views.newspaper.text')
    }

    if (title) {
      title.innerText = utils.translations.translate('views.newspaper.title', {
        name: WA.player.name
      })
    }

    if (picture) {
        picture.src = await WA.player.getWokaPicture()
    }

    if (date) {
      date.innerText = new Date().toDateString()
    }
  })
})