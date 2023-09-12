/// <reference types="@workadventure/iframe-api-typings" />
// @ts-ignore
import { } from "https://unpkg.com/@workadventure/scripting-api-extra@^1";
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
bootstrapExtra();

import {discussion, hiddenZone, hooking, inventory} from './modules'
import {initiateJob, setPlayerJob} from "./modules/job";
import {ActionMessage} from "@workadventure/iframe-api-typings";
import * as utils from "./utils";



WA.onInit().then(() => {
    console.log('door variable', WA.state.chest)
    initiateJob()
    //setPlayerJob('spy')
    inventory.initiateInventory()
    let haveSeenBeginText = false
    let haveBeginDiscussion = false
    const lightLoop = () => {
        setTimeout(() => {
            WA.room.hideLayer('lights/lights1')
            WA.room.showLayer('lights/lights2')
            setTimeout(() => {
                WA.room.hideLayer('lights/lights2')
                WA.room.showLayer('lights/lights1')
                lightLoop()
            }, 300)
        }, 300)
    }
    lightLoop()

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

    let beginZone: ActionMessage|null = null
    WA.room.onEnterLayer(`beginZone`).subscribe(() => {
        if(!haveSeenBeginText) {
            WA.controls.disablePlayerControls()
            beginZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('museum.beginBtn'),
                callback: () => {
                    discussion.openDiscussionWebsite( 'Voix off', 'views.museum.beginText', "Go !", "Discussion", 'middle' , 'middle', '50vh', '90vw', () => {
                        WA.controls.restorePlayerControls()
                        haveSeenBeginText = true
                    })
                }
            })
        }
    })
    WA.room.onLeaveLayer(`beginZone`).subscribe(() => {
        if(!haveSeenBeginText) {
            beginZone?.remove()
        }
    })
    let beginDiscussZone: ActionMessage|null = null
    WA.room.onEnterLayer(`beginDiscussZone`).subscribe(() => {
        if(!haveBeginDiscussion) {
            WA.controls.disablePlayerControls()
            beginDiscussZone = WA.ui.displayActionMessage({
                message: utils.translations.translate('museum.speakToKeeper'),
                callback: () => {
                    discussion.openDiscussionWebsite(WA.player.name, 'views.museum.beginDiscussion', 'views.choice.close', 'discussion', "bottom", 'middle', '50vh', '90vw', () => {
                        WA.controls.restorePlayerControls()
                    })
                }
            })
        }
    })
    WA.room.onLeaveLayer(`beginDiscussZone`).subscribe(() => {
        if(!haveBeginDiscussion) {
            beginDiscussZone?.remove()
        }
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
                                image: 'myItem.png', // here, the path from root is public/images/myItem.png
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
            if(i === 8 && !inventory.hasItem('access-card')) {
                searchZone = WA.ui.displayActionMessage({
                    message: utils.translations.translate('museum.pickpocket'),
                    callback: () => {
                        inventory.addToInventory({
                            id: 'access-card',
                            name: 'museum.accessCard',
                            image: 'myItem.png', // here, the path from root is public/images/myItem.png
                            description: 'museum.accessCardDescription'
                        })
                    }
                })
            } else {
                searchZone = WA.ui.displayActionMessage({
                    message: utils.translations.translate('museum.pickpocket'),
                    callback: () => {
                        searchZone = WA.ui.displayActionMessage({
                            message: utils.translations.translate('museum.pickpocketEmpty'),
                            callback: () => {
                            }
                        })
                    }
                })
            }

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
})

export {};