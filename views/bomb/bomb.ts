/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
//import * as utils from '../../src/utils/index.js'
import * as modules from '../../src/modules/index.js'

document.addEventListener("DOMContentLoaded", () => {
  WA.onInit().then(async () => {

    const clickableParts = document.getElementsByClassName('clickable')

    const patterns = [
      ['pave1', 'pave5', 'pave3', 'cableRed', 'cableWhite', 'boum'],
      ['pave5', 'pave6', 'pave9', 'cableBlue', 'cableYellow', 'cableBlack', 'press'],
      ['cableRed', 'cableYellow', 'pave9', 'pave6', 'pave4', 'pave0', 'boum'],
      ['pave1', 'cableGreen', 'pave9', 'pave7', 'cableOrange', 'pave2', 'boum'],
      ['cableYellow', 'cableRed', 'pave8', 'pave6', 'cableWhite', 'press'],
      ['cableOrange', 'cableBlue', 'pave4', 'pave3', 'cableRed', 'pave0', 'press'],
    ]

    const resetBomb = () => {
      if (clickableParts) {
        for (let i = 0; i < clickableParts.length; i++) {
          clickableParts[i].classList.remove('clicked')
        }
      }
    }

    const whenWrong = () => {
      console.log('PERDU')
      resetBomb()
    }

    const whenResolved = () => {
      console.log('résolu !')
    }

    modules.arrayFilling.setArrayFilling('bomb', patterns, whenWrong, whenResolved)

    if (clickableParts) {
      for (let i = 0; i < clickableParts.length; i++) {
        clickableParts[i].addEventListener('click', () => {
          console.log(clickableParts[i].getAttribute('id'))
          clickableParts[i].classList.add('clicked')
          modules.arrayFilling.testArrayFilling('bomb', clickableParts[i].getAttribute('id'))
        })
      }
    }
  })
})

export {}