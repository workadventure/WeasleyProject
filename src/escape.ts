/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
bootstrapExtra();

import {hiddenZone, actionForAllPlayers, secretPassages, readRunes, arrayFilling} from './modules'
import {initiateJob, setPlayerJob} from "./modules/job";
import {ActionMessage} from "@workadventure/iframe-api-typings";
import * as utils from "./utils";
import {
    activateActionForAllPlayer,
    hasBeenTriggered,
    initializeRelativeActionForAllPlayers
} from "./modules/actionForAllPlayers";


WA.onInit().then(() => {
    initiateJob()
    //setPlayerJob('spy')
    setPlayerJob('archaeologist')
    secretPassages.initiateSecretPassages(
        ['secretPassage'], // List of your secretPassageGroups names
        [() => {console.log('secret passage discovered !')} // List of callbacks for every secretPassageGroups
        ])

    for (let i = 1; i < 11; i++) {
        hiddenZone.initiateHiddenZones([{stepIn: `eyes/eye${[i]}`, hide: `blackFogs/blackFog${[i]}`}])
    }

    hiddenZone.initiateHiddenZones([{stepIn: 'stepMapFog1', hide: 'mapFog1'}])
    hiddenZone.initiateHiddenZones([{stepIn: 'stepMapFog2', hide: 'mapFogn'}])
    // Runes reading initialisation
    readRunes.initiateRunesReading()

    // For each one of your reading zones
    readRunes.setRunesReadingZone('runeZone', {content : 'escape.content', title: 'escape.title'})

    initializeRelativeActionForAllPlayers('victory', ['blue', 'yellow', 'red'], () => {
        WA.room.hideLayer('runes/lightOff')
        WA.room.showLayer('runes/lightOn')
        secretPassages.removeBlocksTiles('victoryRunes')
        WA.room.hideLayer('victoryRunesWall')
        WA.room.showLayer('victoryRunes/openedWall')
    })

    arrayFilling.setArrayFilling(
        'readRunesEscape',
        [
            ['blue', 'yellow', 'red']
        ],
        () => {
            restartRunes()

        },
        () => {
        }
    )
    actionForAllPlayers.initializeActionForAllPlayers('blue', (activate:boolean) => {
        if(activate) {
            WA.room.hideLayer('runes/angel')
            WA.room.showLayer('runes/angelOn')
        } else {
            WA.room.hideLayer('runes/angelOn')
            WA.room.showLayer('runes/angel')
        }

    }, false)

    let blueOn: ActionMessage|null = null
    WA.room.onEnterLayer('runes/left').subscribe(() => {
        if (!WA.state.runesVictory && !hasBeenTriggered('blue')) {
            blueOn = WA.ui.displayActionMessage({
                message: utils.translations.translate('escape.active'),
                callback: () => {
                    activateActionForAllPlayer('blue', true)
                    arrayFilling.testArrayFilling('readRunesEscape', 'blue')
                }
            })
        }
    })
    WA.room.onLeaveLayer(`runes/left`).subscribe(() => {
        blueOn?.remove()
    })

    actionForAllPlayers.initializeActionForAllPlayers('red', (activate:boolean) => {
        if(activate) {
            WA.room.hideLayer('runes/demon')
            WA.room.showLayer('runes/demonOn')
        } else {
            WA.room.hideLayer('runes/demonOn')
            WA.room.showLayer('runes/demon')
        }

    }, false)

    let redOn: ActionMessage|null = null
    WA.room.onEnterLayer('runes/center').subscribe(() => {
        if (!WA.state.runesVictory && !WA.state.demon) {
            redOn = WA.ui.displayActionMessage({
                message: utils.translations.translate('escape.active'),
                callback: () => {
                    activateActionForAllPlayer('red', true)
                    arrayFilling.testArrayFilling('readRunesEscape', 'red')
                }
            })
        }
    })
    WA.room.onLeaveLayer(`runes/center`).subscribe(() => {
        redOn?.remove()
    })

    actionForAllPlayers.initializeActionForAllPlayers('yellow', (activate:boolean) => {
        if(activate) {
            WA.room.hideLayer('runes/knight')
            WA.room.showLayer('runes/knightOn')
        } else {
            WA.room.hideLayer('runes/knightOn')
            WA.room.showLayer('runes/knight')
        }

    }, false)

    let yellowOn: ActionMessage|null = null
    WA.room.onEnterLayer('runes/right').subscribe(() => {
        if (!WA.state.runesVictory && !WA.state.knight) {
            yellowOn = WA.ui.displayActionMessage({
                message: utils.translations.translate('escape.active'),
                callback: () => {
                    activateActionForAllPlayer('yellow', true)
                    arrayFilling.testArrayFilling('readRunesEscape', 'yellow')
                }
            })
        }
    })
    WA.room.onLeaveLayer(`runes/right`).subscribe(() => {
        yellowOn?.remove()
    })
    const restartRunes = () => {
        setTimeout(()=> {
            activateActionForAllPlayer('red', false)
            activateActionForAllPlayer('blue', false)
            activateActionForAllPlayer('yellow', false)
        }, 300)
    }

    WA.room.onEnterLayer('dalles/dK').subscribe(() => {
        WA.room.showLayer('dalles/dKPush')
    })
    WA.room.onLeaveLayer(`dalles/dK`).subscribe(() => {
        WA.room.hideLayer('dalles/dKPush')
    })
    WA.room.onEnterLayer('dalles/dA').subscribe(() => {
        WA.room.showLayer('dalles/dAPush')
    })
    WA.room.onLeaveLayer(`dalles/dA`).subscribe(() => {
        WA.room.hideLayer('dalles/dAPush')
    })
    WA.room.onEnterLayer('dalles/dD').subscribe(() => {
        WA.room.showLayer('dalles/dDPush')
    })
    WA.room.onLeaveLayer(`dalles/dD`).subscribe(() => {
        WA.room.hideLayer('dalles/dDPush')
    })

    actionForAllPlayers.initializeActionForAllPlayers('artifactBrok', () => {
        activateActionForAllPlayer('artifactBrok', true)
        WA.room.hideLayer('artifact')
        WA.room.showLayer('brokenArtifact')
        secretPassages.removeBlocksTiles('finishedDoor')
        WA.room.hideLayer('finishedWall1')
        WA.room.showLayer('finishedDoor/openedDoor1')
        WA.room.hideLayer('finishedWall2')
        WA.room.showLayer('finishedDoor/openedDoor2')
        WA.room.hideLayer('templeDoorEmpty')
        WA.room.showLayer('templeDoorLight')
    })
    let artifact: ActionMessage|null = null
    WA.room.onEnterLayer('artifactZone').subscribe(() => {
        if(!hasBeenTriggered('artifactBrok')) {
            artifact = WA.ui.displayActionMessage({
                message: utils.translations.translate('escape.artifact'),
                callback: () => {
                    actionForAllPlayers.activateActionForAllPlayer('artifactBrok')
                }
            })
        }
    })
    WA.room.onLeaveLayer(`artifactZone`).subscribe(() => {
        if(!hasBeenTriggered('artifactBrok')) {
            artifact?.remove()
        }
    })


})

export {};