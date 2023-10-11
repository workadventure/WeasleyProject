/// <reference types="@workadventure/iframe-api-typings" />
// @ts-ignore
import { } from "https://unpkg.com/@workadventure/scripting-api-extra@^1";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
bootstrapExtra();

import {discussion, hiddenZone, hooking, inventory, actionForAllPlayers, notifications } from './modules'
import {canUser, getPlayerJob, initiateJob, setPlayerJob} from "./modules/job";
import {ActionMessage, UIWebsite} from "@workadventure/iframe-api-typings";
import * as utils from "./utils";
import {env, rootLink} from "./config";
import {toggleLayersVisibility} from "./utils/layers";

WA.onInit().then(() => {
    initiateJob()

    if (env === 'dev') {
        console.log('chest value', WA.state.chest)
        setPlayerJob('spy')
    }
    // Inventory initialisation
    inventory.initiateInventory()

    // Add copy of the map to inventory if has already been retrieved (in case of reload)
    if (WA.state.mapRetrieved) {
        inventory.addToInventory({
            id: 'secret-map',
            name: 'museum.secretMap.title',
            image: 'secret-map.png',
            description: 'museum.secretMap.description'
        })
    }


    WA.state.onVariableChange('chest').subscribe((value) => {
        if (value && !WA.state.mapRetrieved) {
            WA.state.mapRetrieved = true
        }
    })

    WA.state.onVariableChange('mapRetrieved').subscribe((value) => {
        if (value) {
            notifications.notify('La carte a été récupérée !', 'utils.success', 'success')
            inventory.addToInventory({
                id: 'secret-map',
                name: 'museum.secretMap.name',
                image: 'secret-map.png',
                description: 'museum.secretMap.description'
            })
        }
    })

    // Go out after retrieving the map
    let outMessage: ActionMessage | null = null
    WA.room.onEnterLayer('start').subscribe(() => {
        if (WA.state.mapRetrieved) {
            outMessage = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {
                    action: utils.translations.translate('museum.escape')
                }),
                callback: () => {
                    WA.nav.goToRoom('maze.tmj');
                }
            })
        }
    })

    WA.room.onLeaveLayer('start').subscribe(() => {
        outMessage?.remove()
        outMessage = null
    })

    const launchTutorial = () => {
        // Disable player controls
        WA.controls.disablePlayerControls()

        // Open tutorial discussion
        discussion.openDiscussionWebsite( 'utils.voiceOver', 'views.museum.beginText', "museum.go", "Discussion", 'middle' , 'middle', '50vh', '90vw', () => {
            discussion.openDiscussionWebsite(WA.player.name, 'views.museum.beginDiscussion', 'views.choice.close', 'discussion', "bottom", 'middle', '50vh', '90vw', () => {
                // Restore player controls
                WA.controls.restorePlayerControls()
            })
        })
    }
    launchTutorial()

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

    let keeperZone: ActionMessage|null = null
    WA.room.onEnterLayer(`bigRoomAccess/keeperZone`).subscribe(() => {
            keeperZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('museum.speakToKeeper'),
                callback: () => {
                    if(inventory.hasItem('id-card')) {
                        discussion.openDiscussionWebsite('views.museum.keeperName', 'views.museum.bigRoomAccess')
                        const tiles = []
                        tiles.push({ x: 25, y: 44, tile: null, layer: `bigRoomAccess/bigRoomCollides` });
                        tiles.push({ x: 26, y: 44, tile: null, layer: `bigRoomAccess/bigRoomCollides` });
                        WA.room.setTiles(tiles)
                        WA.room.hideLayer('doorsClosed/dc6')
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
                    message: utils.translations.translate('museum.search'),
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
                    message: utils.translations.translate('museum.search'),
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
                    message: utils.translations.translate('museum.pickpocket'),
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
                message: utils.translations.translate('museum.desktopOpen'),
                callback: () => {
                    desktopZone = WA.ui.displayActionMessage({
                        message: utils.translations.translate('museum.desktopOpenMsg'),
                        callback: () => {
                            const tiles = []
                            tiles.push({ x: 38, y: 11, tile: null, layer: `desktopCollides` });
                            tiles.push({ x: 39, y: 11, tile: null, layer: `desktopCollides` });
                            WA.room.setTiles(tiles)
                            WA.room.hideLayer('doorsClosed/dc4')
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
                message: utils.translations.translate(`museum.search`),
                callback: () => {
                    desktopSearchZone = WA.ui.displayActionMessage({
                        message: utils.translations.translate(`museum.desktopItems${i}`),
                        callback: () => {
                            if(i === 0) {
                                discussion.openDiscussionWebsite('views.museum.annuaryTitle', 'views.museum.annuaryContent')
                            }
                        }
                    })
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
    const rooms: Record<string, Record<string, number>> = {
        room1: {
            x: 5*32,
            y: 60*32,
            width: 500,
            height: 500,
        },
        room2: {
            x: 5*32,
            y: 44*32,
            width: 500,
            height: 500,
        },
        room3: {
            x: 3*32,
            y: 3*32,
            width: 500,
            height: 500,
        },
        room4: {
            x: 60*32,
            y: 4*32,
            width: 900,
            height: 900,
        },
        room5: {
            x: 50*32,
            y: 32*32,
            width: 400,
            height: 400,
        },
        room6: {
            x: 31*32,
            y: 51*32,
            width: 520,
            height: 520,
        },
        room7: {
            x: 37*32,
            y: 33*32,
            width: 1000,
            height: 1000,
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
        WA.camera.set(
          roomData.x,
          roomData.y,
          roomData.width,
          roomData.height,
          false,
          false,
        )

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
                          // Disable player controls
                          WA.controls.disablePlayerControls()
                      }
                    )
                }
            }
        })
    }

    let computerWebsite: UIWebsite|null = null
    const openComputerWebsite = async () => {
        computerWebsite = await WA.ui.website.open({
            url: `${rootLink}/views/museum/buildingMap.html`,
            allowApi: true,
            allowPolicy: "",
            position: {
                vertical: "middle",
                horizontal: "right",
            },
            size: {
                height: "100vh",
                width: "50vw",
            },
        })
        WA.controls.disablePlayerControls()
        WA.player.state.askForCloseComputerWebsite = false
    }

    const closeComputerWebsite = () => {
        computerWebsite?.close()
        computerWebsite = null
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
    })
})

export {};