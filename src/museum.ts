/// <reference types="@workadventure/iframe-api-typings" />
// @ts-ignore
import { } from "https://unpkg.com/@workadventure/scripting-api-extra@^1";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
bootstrapExtra();

import {discussion, hiddenZone, hooking, inventory, actionForAllPlayers, notifications, workadventureFeatures, cameraMovingMode, digicode } from './modules'
import {Job, canUser, getPlayerJob, initiateJob, setPlayerJob} from "./modules/job";
import {ActionMessage, UIWebsite} from "@workadventure/iframe-api-typings";
import * as utils from "./utils";
import {env, rootLink} from "./config";
import {toggleLayersVisibility} from "./utils/layers";
import { HasPlayerMovedEvent } from "@workadventure/iframe-api-typings/front/Api/Events/HasPlayerMovedEvent";
import { onInit } from "./utils/init";

let moveCameraTimeout: NodeJS.Timeout|undefined = undefined;
let smothCameraUpdate = 0;

onInit().then(async () => {
    await initiateJob()


    const electro = WA.sound.loadSound(`${rootLink}/sounds/electro.mp3`)
    const electroLow = WA.sound.loadSound(`${rootLink}/sounds/electroLow.mp3`)
    let soundConfigLow = {
        volume: 0.4,
        loop: true,
        rate: 1,
        detune: 1,
        delay: 0,
        seek: 0,
        mute: false
    }
    let soundConfig = {
        volume: 1,
        loop: true,
        rate: 1,
        detune: 1,
        delay: 0,
        seek: 0,
        mute: false
    }

    electroLow.play(soundConfigLow)

    let electroH: ActionMessage | null = null
    // Open digicode when walking on chest zone
    WA.room.onEnterLayer('electroH').subscribe(() => {
        electroLow.stop()
        electro.play(soundConfig)

    })

    WA.room.onLeaveLayer('electroH').subscribe(() => {
        electro.stop()
        electroLow.play(soundConfigLow)
        electroH?.remove()
    })

    actionForAllPlayers.initializeActionForAllPlayers('retrieveMap', () => {
        // Get map
        inventory.addToInventory({
            id: 'secret-map',
            name: 'museum.secretMap.title',
            image: 'secret-map.png',
            description: 'museum.secretMap.description'
        })

        notifications.notify('museum.mapRetrieved', 'utils.success', 'success')

        // Show chest open state
        utils.layers.toggleLayersVisibility(['chestOpened'], true)

        // Close digicode
        digicode.closeDigicode()
    })


    // Create digicode for chest
    digicode.createDigicode('chestDigicode', [{
        code: '160616',
        callback: () => {
            WA.state.mapRetrieved = true
            actionForAllPlayers.activateActionForAllPlayer('retrieveMap')
        }
    }])

    // Digicodes initialisation
    digicode.initiateDigicodes()

    let chestMessage: ActionMessage | null = null
    // Open digicode when walking on chest zone
    WA.room.onEnterLayer('chestZone').subscribe(() => {
        if (!actionForAllPlayers.hasBeenTriggered('retrieveMap')) {
            chestMessage = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.inspect')
                }),
                callback: () => {
                    digicode.openDigicode('chestDigicode')
                }
            })
        }
    })

    WA.room.onLeaveLayer('chestZone').subscribe(() => {
        chestMessage?.remove()
        chestMessage = null
    })

    // Hide pricing button
    workadventureFeatures.hidePricingButton()

    // Hide invite Button
    workadventureFeatures.hideInviteButton()

    // Hide premium banner
    workadventureFeatures.hidePremiumBanner()

    // Camera moving mode
    cameraMovingMode.initializeCameraMovingMode()

    if (env === 'dev') {
        setPlayerJob(Job.spy)
    }
    // Inventory initialisation
    inventory.initiateInventory()

    // Go out after retrieving the map
    let outMessage: ActionMessage | null = null
    WA.room.onEnterLayer('start').subscribe(() => {
        if (WA.state.mapRetrieved) {
            outMessage = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.escape')
                }),
                callback: () => {
                    electroLow.stop()
                    removePlanButton()
                    WA.nav.goToRoom('maze.tmj');
                }
            })
        }
    })

    WA.room.onLeaveLayer('start').subscribe(() => {
        outMessage?.remove()
        outMessage = null
    })

    const openPlan = () => {
        removePlanButton()
        discussion.openDiscussionWebsite(WA.player.name, 'views.museum.beginDiscussion', 'views.choice.close', 'discussion', "bottom", 'middle', '50vh', '90vw', () => {
            // Restore player controls
            WA.controls.restorePlayerControls()
            // Add plan button
            addPlanButton()
        })
    }

    const launchTutorial = () => {
        // Disable player controls
        WA.controls.disablePlayerControls()

        // Open tutorial discussion
        discussion.openDiscussionWebsite( 'utils.voiceOver', 'views.museum.beginText', "museum.go", "discussion", 'middle' , 'middle', '50vh', '90vw', () => {
            openPlan()
        })
    }

    // Open tutorial at launch
    launchTutorial()

    // Add plan button to read again if needed
    const addPlanButton = () => {
        WA.ui.actionBar.addButton({
            id: 'planButton',
            label: utils.translations.translate('museum.plan'),
            callback:  () => {
                openPlan()
            }
        });
    }

    const removePlanButton = () => {
        WA.ui.actionBar.removeButton('planButton')
    }



    let isLight1Visible = false
    let lightLoop: NodeJS.Timer|null = null
    const launchLightLoop = () => {
        lightLoop = setInterval(() => {
            toggleLayersVisibility('lights/lights1', isLight1Visible)
            toggleLayersVisibility('lights/lights2', !isLight1Visible)
            isLight1Visible = !isLight1Visible
        }, 300);
    }

    const stopLightLoop = () => {
        if (lightLoop) {
            clearInterval(lightLoop)
        }
        lightLoop = null
    }

    const turnOnLights = () => {
        launchLightLoop()
        toggleLayersVisibility('noLights/noLights', false)
        toggleLayersVisibility('noLights/conversations', false)
        toggleLayersVisibility('lights/conversations', true)
    }

    const turnOffLights = () => {
        stopLightLoop()
        toggleLayersVisibility('lights/lights1', false)
        toggleLayersVisibility('lights/lights2', false)
        toggleLayersVisibility('noLights/noLights', true)
        toggleLayersVisibility('noLights/conversations', true)
        toggleLayersVisibility('lights/conversations', false)
    }


    hooking.setHooking('hookingD7', () => {
        const tiles = []
        tiles.push({ x: 5, y: 67, tile: null, layer: `hookingD7/collides` });
        WA.room.setTiles(tiles)
    })

    let closeDoor: ActionMessage|null = null
    WA.room.onEnterLayer('closeDoorMessage').subscribe(() => {

            closeDoor = WA.ui.displayActionMessage({
                message: utils.translations.translate('museum.doorClosed'),
                callback: () => {}
            })
    })
    WA.room.onLeaveLayer(`closeDoorMessage`).subscribe(() => {
        closeDoor?.remove()
    })

    // When the door opens it must open for every player
    actionForAllPlayers.initializeActionForAllPlayers('keeperDoorOpen', () => {
        const tiles = []
        tiles.push({ x: 25, y: 44, tile: null, layer: `bigRoomAccess/bigRoomCollides` });
        tiles.push({ x: 26, y: 44, tile: null, layer: `bigRoomAccess/bigRoomCollides` });
        WA.room.setTiles(tiles)
        WA.room.hideLayer('doorsClosed/dc6')
    })

    let keeperZone: ActionMessage|null = null
    WA.room.onEnterLayer(`bigRoomAccess/keeperZone`).subscribe(() => {
            keeperZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.speakToKeeper')
                }),
                callback: () => {
                    if(inventory.hasItem('id-card')) {
                        discussion.openDiscussionWebsite('views.museum.keeperName', 'views.museum.bigRoomAccess')
                        actionForAllPlayers.activateActionForAllPlayer('keeperDoorOpen')
                    } else {
                        discussion.openDiscussionWebsite('views.museum.keeperName', 'views.museum.bigRoomNoAccess')
                    }
                }
            })
    })
    WA.room.onLeaveLayer(`bigRoomAccess/keeperZone`).subscribe(() => {
        keeperZone?.remove()
    })

    for (let i = 1; i < 8; i++) {
        hiddenZone.initiateHiddenZones([{stepIn: `fogsZone/fog${[i]}`, hide: `fogs/fog${[i]}`}])
    }

    const searchWear = (i: number) => {
        let searchZone: ActionMessage|null = null
        WA.room.onEnterLayer(`search/s${i}`).subscribe(() => {
            if(i === 5 && !inventory.hasItem('id-card')) {
                searchZone = WA.ui.displayActionMessage({
                    message: utils.translations.translate('utils.executeAction', {
                        action: utils.translations.translate('museum.search')
                    }),
                    callback: () => {
                            inventory.addToInventory({
                                id: 'id-card',
                                name: 'museum.idCardTitle',
                                image: 'indentity-card.png',
                                description: 'museum.idCardDescription'
                            })
                        }
                })
            } else {
                searchZone = WA.ui.displayActionMessage({
                    message: utils.translations.translate('utils.executeAction', {
                        action: utils.translations.translate('museum.search')
                    }),
                    callback: () => {
                        searchZone = WA.ui.displayActionMessage({
                            message: utils.translations.translate('museum.searchEmpty'),
                            callback: () => {
                            }
                        })
                    }
                })
            }

        })
        WA.room.onLeaveLayer(`search/s${i}`).subscribe(() => {
            searchZone?.remove()
        })
    }
    for (let i = 1; i < 8; i++) {
        searchWear(i)
    }

    const pickPocket = (i: number) => {
        let searchZone: ActionMessage|null = null
        WA.room.onEnterLayer(`pickPocketInvited/i${i}`).subscribe(() => {
                searchZone = WA.ui.displayActionMessage({
                    message: utils.translations.translate('utils.executeAction', {
                        action: utils.translations.translate('museum.pickpocket')
                    }),
                    callback: () => {
                        if (!actionForAllPlayers.currentValue('switchLights')) {
                            if(i === 8 && !inventory.hasItem('access-card')) {
                                inventory.addToInventory({
                                    id: 'access-card',
                                    name: 'museum.accessCard',
                                    image: 'gold-key.png',
                                    description: 'museum.accessCardDescription'
                                })
                            } else {
                                searchZone = WA.ui.displayActionMessage({
                                    message: utils.translations.translate('museum.pickpocketEmpty'),
                                    callback: () => {
                                    }
                                })
                            }
                        } else {
                            discussion.openDiscussionWebsite(
                              utils.translations.translate('museum.guest'),
                              utils.translations.translate('museum.cannotPickPocket'),
                              'views.choice.close',
                              "discussion",
                              'middle',
                              'middle',
                              '50vh',
                              '50vh',
                              () => {
                                  discussion.openDiscussionWebsite(
                                    utils.translations.translate('utils.mySelf'),
                                    utils.translations.translate('museum.needDistraction'),
                                    'views.choice.close',
                                    "discussion")
                              }
                            )
                        }
                    }
                })
        })
        WA.room.onLeaveLayer(`pickPocketInvited/i${i}`).subscribe(() => {
            searchZone?.remove()
        })
    }
    for (let i = 1; i < 13; i++) {
        pickPocket(i)
    }

    // When the door opens it must open for every player
    actionForAllPlayers.initializeActionForAllPlayers('desktopDoorOpen', () => {
        const tiles = []
        tiles.push({ x: 38, y: 11, tile: null, layer: `desktopCollides` });
        tiles.push({ x: 39, y: 11, tile: null, layer: `desktopCollides` });
        WA.room.setTiles(tiles)
        WA.room.hideLayer('doorsClosed/dc4')
    })

    let desktopZone: ActionMessage|null = null
    WA.room.onEnterLayer(`desktopAccessZone`).subscribe(() => {
        if(!inventory.hasItem('access-card')) {
            desktopZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('museum.doorClosed'),
                callback: () => {

                }
            })
        } else {
            desktopZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.desktopOpen')
                }),
                callback: () => {
                    desktopZone = WA.ui.displayActionMessage({
                        message: utils.translations.translate('museum.desktopOpenMsg'),
                        callback: () => {
                            actionForAllPlayers.activateActionForAllPlayer('desktopDoorOpen')
                        }
                    })
                }
            })
        }
    })
    WA.room.onLeaveLayer(`desktopAccessZone`).subscribe(() => {
        desktopZone?.remove()
    })
    for (let i = 0; i < 9; i++) {
        let desktopSearchZone: ActionMessage|null = null
        WA.room.onEnterLayer(`desktopItems/i${i}`).subscribe(() => {
            desktopSearchZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.search')
                }),
                callback: () => {
                    if (i === 0) {
                        discussion.openDiscussionWebsite('views.museum.annuaryTitle', 'views.museum.annuaryContent')
                    } else {
                        desktopSearchZone = WA.ui.displayActionMessage({
                            message: utils.translations.translate(`museum.desktopItems${i}`),
                            callback: () => {
                            }
                        })
                    }
                }
            })
        })
        WA.room.onLeaveLayer(`desktopItems/i${i}`).subscribe(() => {
            desktopSearchZone?.remove()
        })
    }

    //////////////
    // COMPUTER //
    //////////////

    // Cameras list
    const cameras = [
      'cameraZones/cZone1',
      'cameraZones/cZone2',
      'cameraZones/cZone3',
      'cameraZones/cZone4',
      'cameraZones/cZone5',
      'cameraZones/cZone6'
    ]

    const cameraReturnPosition = [
        {
            x: 8*32,
            y: 68*32
        },
        {
            x: 26*32,
            y: 68*32
        },
        {
            x: 15*32,
            y: 63*32
        },
        {
            x: 10*32,
            y: 27*32
        },
        {
            x: 47*32,
            y: 23*32
        },
        {
            x: 47*32,
            y: 42*32
        }
    ]

    // Rooms list
    const zoom = cameraMovingMode.getZoom()
    const rooms: Record<string, Record<string, number>> = {
        room1: {
            x: 5*32,
            y: 60*32,
            width: zoom,
            height: zoom,
        },
        room2: {
            x: 5*32,
            y: 44*32,
            width: zoom,
            height: zoom,
        },
        room3: {
            x: 3*32,
            y: 3*32,
            width: zoom,
            height: zoom,
        },
        room4: {
            x: 60*32,
            y: 4*32,
            width: zoom,
            height: zoom,
        },
        room5: {
            x: 50*32,
            y: 32*32,
            width: zoom,
            height: zoom,
        },
        room6: {
            x: 31*32,
            y: 51*32,
            width: zoom,
            height: zoom,
        },
        room7: {
            x: 37*32,
            y: 33*32,
            width: zoom,
            height: zoom,
        },
    }

    let userIsBlockedByCamera: null|string = null;
    actionForAllPlayers.initializeActionForAllPlayers(`deactivateCamera`, (value: string) => {
        // Show all cameras zone
        for (let i = 0; i < cameras.length; i++) {
            utils.layers.toggleLayersVisibility(cameras[i], true)
        }

        // Hide camera
        utils.layers.toggleLayersVisibility(value, false)

        // Unlock user
        if (userIsBlockedByCamera === value) {
            WA.controls.restorePlayerControls()
        }
    })

    actionForAllPlayers.initializeActionForAllPlayers('switchLights', (value: boolean) => {
        if (value) {
            turnOnLights()
        } else {
            turnOffLights()
        }
    }, true)

    // Lights are on at launch (Wait 200 for initialization)
    setTimeout(() => {
        if (!actionForAllPlayers.currentValue('switchLights')) {
            turnOffLights()
        } else {
            turnOnLights()
        }
    }, 200)

    if (WA.player.state.askForSwitchLights === undefined) {
        WA.player.state.askForSwitchLights = true
    }

    if (WA.player.state.askForDeactivateCamera === undefined) {
        WA.player.state.askForDeactivateCamera = false
    }

    if (WA.player.state.askForCloseComputerWebsite === undefined) {
        WA.player.state.askForCloseComputerWebsite = false
    }

    if (WA.player.state.askForSeeRoom === undefined) {
        WA.player.state.askForSeeRoom = false
    }

    WA.player.state.onVariableChange('askForDeactivateCamera').subscribe((value) => {
        if (value) {
            actionForAllPlayers.activateActionForAllPlayer('deactivateCamera', value)
        }
    })

    WA.player.state.onVariableChange('askForCloseComputerWebsite').subscribe((value) => {
        if (value) {
            closeComputerWebsite()
        }
    })

    WA.player.state.onVariableChange('askForSwitchLights').subscribe((value) => {
        actionForAllPlayers.activateActionForAllPlayer('switchLights', value)
    })

    WA.player.state.onVariableChange('askForSeeRoom').subscribe((value) => {
        const roomData = rooms['room' + value]

        // Move camera to room
        cameraMovingMode.moveTo(roomData.x, roomData.y)

        utils.layers.toggleLayersVisibility(`fogs/fog${value}`, false)
    })

    for (let i = 0; i < cameras.length; i++) {
        WA.room.onEnterLayer(cameras[i]).subscribe(() => {
            if (actionForAllPlayers.currentValue('deactivateCamera') !== cameras[i]) {
                if (getPlayerJob() === 'spy') {
                    discussion.openDiscussionWebsite(
                      'utils.mySelf',
                      'museum.cantStayInCamera',
                      'utils.close',
                      "discussion",
                      'bottom',
                      'middle',
                      '50vh',
                      '50vh',
                      async () => {
                          // Disable player controls
                          WA.controls.disablePlayerControls()
                          await WA.player.moveTo(cameraReturnPosition[i].x, cameraReturnPosition[i].y)
                          WA.controls.restorePlayerControls()
                      }
                    )
                } else {
                    // Save wich camera is blocking user
                    userIsBlockedByCamera = cameras[i]
                    // Show message
                    discussion.openDiscussionWebsite(
                      'utils.mySelf',
                      'museum.cannotWalkInCameras',
                      'utils.close',
                      "discussion",
                      'bottom',
                      'middle',
                      '50vh',
                      '50vh',
                      () => {
                          // IMPORTANT : REPEAT THE IF HERE IN CASE USER CLICK ON OK WHEN CAMERA HAS BEEN DEACTIVATED
                          if (actionForAllPlayers.currentValue('deactivateCamera') !== userIsBlockedByCamera) {
                              // Disable player controls
                              WA.controls.disablePlayerControls()
                          }
                      }
                    )
                }
            }
        })
    }

    let computerWebsite: UIWebsite|null = null
    const openComputerWebsite = async () => {
        // Open modal
        WA.ui.modal.openModal({
            title: 'Camera Map',
            src : `${rootLink}/views/museum/buildingMap.html`,
            position: 'right',
            allowApi: true,
            allow: "fullscreen",
        }, () => {
            closeComputerWebsite();
        })

        const position = WA.state.loadVariable('currentCameraPosition');
        if (position) {
            const {x, y} = position as {x: number, y: number};
            moveCamera(x, y);
        }

        WA.controls.disablePlayerControls();
        WA.player.state.askForCloseComputerWebsite = false;
        cameraMovingMode.setCameraPositionToPlayerPosition();
        cameraMovingMode.openCameraMovingWebsite();

    }

    const closeComputerWebsite = () => {
        computerWebsite?.close()
        computerWebsite = null
        cameraMovingMode.closeCameraMovingWebsite()
        WA.controls.restorePlayerControls()
        WA.camera.followPlayer(true)
    }

    // Hack computer
    let computerMessage: ActionMessage|null = null
    WA.room.onEnterLayer('computerZone').subscribe(() => {
        computerMessage = WA.ui.displayActionMessage({
            message: utils.translations.translate('utils.executeAction', {
                action: utils.translations.translate('utils.hack')
            }),
            callback: () => {
                if (!canUser('useComputers')) {
                    discussion.openDiscussionWebsite(
                      'utils.mySelf',
                      'museum.cannotUseComputers',
                      'utils.close',
                      "discussion"
                    )
                } else {
                    openComputerWebsite()
                }
            }
        })
    })

    WA.room.onLeaveLayer('computerZone').subscribe(() => {
        computerMessage?.remove()
        computerMessage = null
    });

    WA.state.saveVariable('currentCameraPosition', {
        x: 0,
        y: 0
    }).catch(e => console.error('Something went wrong while saving variable', e));

    if(canUser('useComputers')) {
        WA.state.onVariableChange('currentCameraPosition').subscribe((value) => {
            const {x, y} = value as {x: number, y: number};
            moveCamera(x, y);
        });
    }else{
        WA.player.onPlayerMove((event: HasPlayerMovedEvent) => {
            savePositionEverySecond(event);
        });
    }
})

const moveCamera = (x: number, y: number) => {
    WA.camera.set(x, y, undefined, undefined, true, true);
    smothCameraUpdate = 0;
    moveCameraTimeout = undefined;
}

const savePositionEverySecond = (event: HasPlayerMovedEvent) => {
    smothCameraUpdate++;
    if (smothCameraUpdate > 5) {
        WA.state.currentCameraPosition = {x: event.x, y: event.y};
        smothCameraUpdate = 0;
    }else{
        if(moveCameraTimeout) clearTimeout(moveCameraTimeout);
        moveCameraTimeout = setTimeout(() => {
            WA.state.currentCameraPosition = {x: event.x, y: event.y};
            smothCameraUpdate = 0;
        }, 1000);
    }
};

export {};