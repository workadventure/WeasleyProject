/// <reference types="@workadventure/iframe-api-typings" />
import {arrayFilling, readRunes} from './modules'
import {initiateJob} from "./modules/job";
import { sounds } from './modules'

WA.onInit().then(async () => {
    // Jobs initialisation
    await initiateJob()

    // Sounds initialisation
    sounds.initiateSounds([
        {
            name: 'doSound',
            path: 'do.mp3'
        },
        {
            name: 'reSound',
            path: 're.mp3'
        },
        {
            name: 'miSound',
            path: 'mi.mp3'
        },
        {
            name: 'faSound',
            path: 'fa.mp3'
        },
        {
            name: 'solSound',
            path: 'sol.mp3'
        },
        {
            name: 'laSound',
            path: 'la.mp3'
        },
        {
            name: 'siSound',
            path: 'si.mp3'
        }
    ])

    const disableAll = false
    const enableRedirect = true

    if(!disableAll) {
        const removeTiles = () => {
            WA.room.hideLayer('notes/do')
            WA.room.hideLayer('notes/re')
            WA.room.hideLayer('notes/mi')
            WA.room.hideLayer('notes/fa')
            WA.room.hideLayer('notes/sol')
            WA.room.hideLayer('notes/la')
            WA.room.hideLayer('notes/si')
            WA.room.showLayer('notes_grey')
        }

        if(WA.state.victory){
            removeTiles()
        }

        WA.state.onVariableChange("victory").subscribe((value) => {
            if (value) {
                removeTiles()
            }
        })

        arrayFilling.setArrayFilling(
            'musicTiles',
            [
                ['fa', 'si', 'do', 're', 'mi', 'fa', 're', 'fa', 're', 'fa', 'si', 're', 'si', 'sol', 're', 'si']
            ],
            () => {
                if (enableRedirect) {
                    sounds.playSound('failureSound')
                    WA.nav.goToRoom('./music.tmj')
                }
            },
            () => {
                WA.state.victory = true
                sounds.playSound('successSound')
                removeTiles()
            }
        )

        WA.room.onEnterLayer('notes/do').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('doSound')
                arrayFilling.testArrayFilling('musicTiles', 'do')
            }
        })
        WA.room.onEnterLayer('notes/re').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('reSound')
                arrayFilling.testArrayFilling('musicTiles', 're')
            }
        })
        WA.room.onEnterLayer('notes/mi').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('miSound')
                arrayFilling.testArrayFilling('musicTiles', 'mi')
            }
        })
        WA.room.onEnterLayer('notes/fa').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('faSound')
                arrayFilling.testArrayFilling('musicTiles', 'fa')
            }
        })
        WA.room.onEnterLayer('notes/sol').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('solSound')
                arrayFilling.testArrayFilling('musicTiles', 'sol')
            }
        })
        WA.room.onEnterLayer('notes/la').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('laSound')
                arrayFilling.testArrayFilling('musicTiles', 'la')
            }
        })
        WA.room.onEnterLayer('notes/si').subscribe(() => {
            if (!WA.state.victory) {
                sounds.playSound('siSound')
                arrayFilling.testArrayFilling('musicTiles', 'si')
            }
        })

        // Runes reading initialisation
        readRunes.initiateRunesReading()
        readRunes.setRunesReadingZone('infos', {content : 'views.music.text', title: 'views.music.title'})
    }
})

export {};