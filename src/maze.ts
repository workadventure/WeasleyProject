/// <reference types="@workadventure/iframe-api-typings" />

import {hiddenZone, excavations, inventory, switchingTiles, hooking} from './modules'
import {setPlayerJob, initiateJob} from "./modules/job";
import * as utils from './utils'
import {ActionMessage} from "@workadventure/iframe-api-typings";
import {env} from "./config"

WA.onInit().then(() => {
    for (let i = 1; i < 10; i++) {
        hiddenZone.initiateHiddenZones([{stepIn: `fogFloor/fog${[i]}`, hide: `fog/fog${[i]}`}])
    }


    WA.player.state.hasFoundBlueSeed = false
    WA.player.state.hasFoundGreenSeed = false
    WA.player.state.hasFoundRedSeed = false

    // Initiate inventory
    inventory.initiateInventory()

    // Initiate job
    initiateJob()


    WA.state.onVariableChange("blueFire").subscribe((value)=> {
        if(value) {
            WA.room.hideLayer('torchesTop/offTop/torcheBlueOffTop')
            WA.room.hideLayer('torchesBot/offBot/torcheBlueOffBot')
            WA.room.showLayer('torchesTop/onTop/torcheBlueOnTop')
            WA.room.showLayer('torchesBot/onBot/torcheBlueOnBot')
        }
    })
    WA.player.state.onVariableChange("hasFoundBlueSeed").subscribe(()=> {
        WA.room.hideLayer('blueSeed')
    })

    WA.state.onVariableChange("greenFire").subscribe((value)=> {
        if(value) {
            WA.room.hideLayer('torchesTop/offTop/torcheGreenOffTop')
            WA.room.hideLayer('torchesBot/offBot/torcheGreenOffBot')
            WA.room.showLayer('torchesTop/onTop/torcheGreenOnTop')
            WA.room.showLayer('torchesBot/onBot/torcheGreenOnBot')
        }
    })
    WA.player.state.onVariableChange("hasFoundGreenSeed").subscribe(()=> {
        WA.room.hideLayer('excavations/exca6/found')
    })

    WA.state.onVariableChange("redFire").subscribe((value)=> {
        if(value) {
            WA.room.hideLayer('torchesTop/offTop/torcheRedOffTop')
            WA.room.hideLayer('torchesBot/offBot/torcheRedOffBot')
            WA.room.showLayer('torchesTop/onTop/torcheRedOnTop')
            WA.room.showLayer('torchesBot/onBot/torcheRedOnBot')
        }
    })
    WA.player.state.onVariableChange("hasFoundRedSeed").subscribe(()=> {
        console.log('todo')
    })

    if(env === 'dev'){
        WA.player.state.hasFoundBlueSeed = true
        WA.player.state.hasFoundGreenSeed = true
        WA.player.state.hasFoundRedSeed = true
        setPlayerJob('archaeologist')
        inventory.addToInventory({
            id: 'powder',
            name: utils.translations.translate('maze.powder'),
            image: 'poudre.png', // here, the path from root is public/images/inventory/myItem.png
            description: utils.translations.translate('maze.powderDescription')
        })
        inventory.addToInventory({
            id: 'seed',
            name: utils.translations.translate('maze.seed'),
            image: 'graine.png', // here, the path from root is public/images/inventory/myItem.png
            description: utils.translations.translate('maze.seedDescription')
        })
        inventory.addToInventory({
            id: 'gem',
            name: utils.translations.translate('maze.gem'),
            image: 'gem.png', // here, the path from root is public/images/inventory/myItem.png
            description: utils.translations.translate('maze.gemDescription')
        })
    }

    // Initiate Hidden Zone
    hiddenZone.initiateHiddenZones([{stepIn: 'hiddenZoneFloor/hiddenZoneFloor', hide: 'hiddenZoneTop'}])

    // Hooking
    hooking.setHooking('hiddenZoneFloor/hooking', ()=> {
        inventory.addToInventory({
            id: 'gem',
            name: utils.translations.translate('maze.gem'),
            image: 'gem.png', // here, the path from root is public/images/inventory/myItem.png
            description: utils.translations.translate('maze.gemDescription')
        })
        WA.player.state.hasFoundRedSeed = true
    })

    // excavations initialisation
    excavations.initiateExcavations(
        ['excavations/exca1', 'excavations/exca2', 'excavations/exca3', 'excavations/exca4', 'excavations/exca5'], // List of your excavationGroups names
        [() => {
            console.log('Excavation has been made !')} // List of callbacks for your excavationGroups
        ])

    let findSeed: ActionMessage|null = null

    excavations.initiateExcavations(
        ['excavations/exca6'], // List of your excavationGroups names
        [() => {
            WA.room.onEnterLayer(`excavations/exca6/found`).subscribe(() => {
                if(!WA.player.state.hasFoundGreenSeed){
                    findSeed = WA.ui.displayActionMessage({
                        message: utils.translations.translate('maze.takeSeedMsg'),
                        callback: () => {
                            inventory.addToInventory({
                                id: 'graine',
                                name: utils.translations.translate('maze.seed'),
                                image: 'graine.png', // here, the path from root is public/images/inventory/myItem.png
                                description: utils.translations.translate('maze.seedDescription')
                            })
                            WA.player.state.hasFoundGreenSeed = true
                        }
                    })
                }
            })

            WA.room.onLeaveLayer(`excavations/exca6/trace`).subscribe(() => {
                findSeed?.remove()
            })
           } // List of callbacks for your excavationGroups
        ])


    // Switching tiles initiate
    switchingTiles.initiateSwitchingTiles(
        ['switchingTiles'],
        [() => {
            WA.room.hideLayer('blueArtifact')
            WA.room.showLayer('blueSeed')
            WA.room.showLayer('switchTileVictory')
            WA.room.onEnterLayer(`blueSeed`).subscribe(() => {
                if(!WA.player.state.hasFoundBlueSeed) {
                    findSeed = WA.ui.displayActionMessage({
                        message: utils.translations.translate('maze.takePowderMsg'),
                        callback: () => {
                            inventory.addToInventory({
                                id: 'powder',
                                name: utils.translations.translate('maze.powder'),
                                image: 'poudre.png', // here, the path from root is public/images/inventory/myItem.png
                                description: utils.translations.translate('maze.powderDescription')
                            })
                            WA.player.state.hasFoundBlueSeed = true
                        }
                    })
                }
            })

            WA.room.onLeaveLayer(`blueSeed`).subscribe(() => {
                findSeed?.remove()
            })
        }])

    // Trigger fire
    let triggerBlue: ActionMessage|null = null
    WA.room.onEnterLayer(`triggerBlue`).subscribe(() => {
        if(!WA.state.blueFire){
            if(WA.player.state.hasFoundBlueSeed) {
                triggerBlue = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.triggerBlue'),
                    callback: () => {
                        inventory.removeFromInventory('powder')
                        WA.state.blueFire = true
                    }
                })
            }
            else {
                triggerBlue = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.empty'),
                    callback: () => {
                    }
                })
            }
        } else {
            triggerBlue = WA.ui.displayActionMessage({
                message: utils.translations.translate('maze.fireOn'),
                callback: () => {
                }
            })
        }

    })
    WA.room.onLeaveLayer(`triggerBlue`).subscribe(() => {
        triggerBlue?.remove()
    })

    let triggerRed: ActionMessage|null = null
    WA.room.onEnterLayer(`triggerRed`).subscribe(() => {
        if(!WA.state.redFire){
            if(WA.player.state.hasFoundRedSeed) {
                triggerRed = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.triggerRed'),
                    callback: () => {
                        inventory.removeFromInventory('gem')
                        WA.state.redFire = true
                    }
                })
            }
            else {
                triggerRed = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.empty'),
                    callback: () => {
                    }
                })
            }
        } else {
            triggerRed = WA.ui.displayActionMessage({
                message: utils.translations.translate('maze.fireOn'),
                callback: () => {
                }
            })
        }

    })
    WA.room.onLeaveLayer(`triggerRed`).subscribe(() => {
        triggerRed?.remove()
    })

    let triggerGreen: ActionMessage|null = null
    WA.room.onEnterLayer(`triggerGreen`).subscribe(() => {
        if(!WA.state.greenFire){
            if(WA.player.state.hasFoundGreenSeed) {
                triggerGreen = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.triggerGreen'),
                    callback: () => {
                        inventory.removeFromInventory('seed')
                        WA.state.greenFire = true
                    }
                })
            }
            else {
                triggerGreen = WA.ui.displayActionMessage({
                    message: utils.translations.translate('maze.empty'),
                    callback: () => {
                    }
                })
            }
        } else {
            triggerGreen = WA.ui.displayActionMessage({
                message: utils.translations.translate('maze.fireOn'),
                callback: () => {
                }
            })
        }

    })
    WA.room.onLeaveLayer(`triggerGreen`).subscribe(() => {
        triggerGreen?.remove()
    })

    WA.state.onVariableChange('blueFire').subscribe(() => {
        checkIfAllFireIsOn()
    })
    WA.state.onVariableChange('redFire').subscribe(() => {
        checkIfAllFireIsOn()
    })
    WA.state.onVariableChange('greenFire').subscribe(() => {
        checkIfAllFireIsOn()
    })
    const checkIfAllFireIsOn = () => {
        if(WA.state.blueFire && WA.state.redFire && WA.state.greenFire) {
            WA.room.showLayer('dragonTopLight')
            WA.room.showLayer('dragonLight')
            WA.room.showLayer('mountainDoorAnimate')
            WA.room.setTiles([{ x: 16, y: 4, tile: null, layer: `collisions` }])
        }
    }
    checkIfAllFireIsOn()

})

export {};