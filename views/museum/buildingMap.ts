/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as utils from '../../src/utils/index.js'
import * as modules from '../../src/modules/index.js'

document.addEventListener("DOMContentLoaded", () => {
  WA.onInit().then(async () => {
    const askForDeactivateCamera = (value: string | null) => {
      WA.player.state.askForDeactivateCamera = value ? 'cameraZones/' + value : null
    }

    const askForSeeRoom = (value: string | null) => {
      WA.player.state.askForSeeRoom = value
    }

    const askForCloseComputerWebsite = () => {
      WA.player.state.askForCloseComputerWebsite = true
    }

    const cameras = document.getElementsByClassName('camera')
    const rooms = document.getElementsByClassName('room')
    const closeButton = document.getElementById('closeButton')

    if (cameras) {
      for (let i = 0; i < cameras.length; i++) {
        cameras[i].addEventListener('click', () => {
          for (let i = 0; i < cameras.length; i++) {
            cameras[i].classList.remove('deactivated')
          }
          console.log(cameras[i].getAttribute('id'))
          cameras[i].classList.add('deactivated')
          askForDeactivateCamera(cameras[i].getAttribute('id'))
        })
      }
    }

    if (rooms) {
      for (let i = 0; i < rooms.length; i++) {
        rooms[i].addEventListener('click', () => {
          const roomId = rooms[i].getAttribute('id');
          console.log('room', roomId.replace('room', ''))
          if (roomId) {
            askForSeeRoom(roomId.replace('room', ''))
          }
        })
      }
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        askForCloseComputerWebsite()
      })
    }
  })
})