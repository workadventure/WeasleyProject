import {rootLink} from "../config";

type soundType = {
  name: string,
  path: ''
}

const sounds: Record<string, any> = {
  successSound: WA.sound.loadSound(`${rootLink}/sounds/success.mp3`),
  failureSound: WA.sound.loadSound(`${rootLink}/sounds/failure.mp3`)
}

const soundConfig = {
  volume: 1,
  loop: false,
  rate: 1,
  detune: 1,
  delay: 0,
  seek: 0,
  mute: false
}

// initiate player inventory (reset all items)
const initiateSounds = (soundList: Array<soundType>, soundsPath: string = `${rootLink}/sounds/`) => {
  for (let i = 0; i < soundList.length; i++) {
    sounds[soundList[i].name] = WA.sound.loadSound(`${soundsPath}${soundList[i].path}`)
  }
}

const playSound = (name: string) => {
  sounds[name].play(soundConfig);
}

export {
  initiateSounds,
  playSound
}