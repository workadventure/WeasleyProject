/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from '@workadventure/iframe-api-typings';
import {discussion, inventory} from './modules'
import {getPlayerJob, resetPlayerJob, setPlayerJob, initiateJob} from "./modules/job";
import * as utils from "./utils";


const getPlayers = async () => {
    await WA.players.configureTracking()
    return WA.players.list()
}

const allPlayersGotJob = async () => {
    const players = await getPlayers()
    let count = 0
    for (let player of players) {
        count++
        if(!player.state.job) {
            return false
        }
    }
    if(count > 0){
        WA.state.allPlayersGotJob = true
        return true
    }
    return false
}



// Waiting for the API to be ready
WA.onInit().then(() => {

    console.log('@@@@@@@ test de la variable de room : ', WA.state.test)
    // Initiate inventory
    inventory.initiateInventory()

    // Initiate job
    initiateJob()

    WA.state.onVariableChange('allPlayersGotJob').subscribe((value) => {
        if(value) {
            WA.nav.goToRoom('./maze.tmj') // TODO changer la map
        }
    })

    resetPlayerJob()

    let talk: ActionMessage;
    WA.room.onEnterLayer('talk').subscribe(() => {
        talk = WA.ui.displayActionMessage({
            message: utils.translations.translate('utils.executeAction', {action : utils.translations.translate('choice.talk')}),
            callback: () => {
                discussion.openDiscussionWebsite('views.choice.title', 'views.choice.text')
            }
        });
    })
    WA.room.onLeaveLayer('talk').subscribe(() => {
        talk.remove()
    })

    let becomeSpy: ActionMessage;
    WA.room.onEnterLayer('spy').subscribe(async () => {
        const players = await getPlayers()
        let spySelected = false
        for (let player of players) {
            if(player.state.job === 'spy') {

                spySelected = true
            }
        }
        if(!spySelected && !getPlayerJob()) {
            becomeSpy = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {action : utils.translations.translate('choice.spyMessage')}),
                callback: () => {
                    setPlayerJob('spy')
                    console.log(getPlayerJob())
                    allPlayersGotJob()
                }
            });
        }
    })
    WA.room.onLeaveLayer('spy').subscribe(() => {
        becomeSpy.remove()
    })

    let becomeArcheo: ActionMessage;
    WA.room.onEnterLayer('archeo').subscribe(async() => {
        const players = await getPlayers()
        let archeoSelected = false
        for (let player of players) {
            if(player.state.job === 'archaeologist') {
                archeoSelected = true
            }
        }
        if(!archeoSelected && !getPlayerJob()) {
            becomeArcheo = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {action : utils.translations.translate('choice.archeoMessage')}),
                callback: () => {
                    setPlayerJob('archaeologist')
                    console.log(getPlayerJob())
                    allPlayersGotJob()
                }
            });
        }
    })
    WA.room.onLeaveLayer('archeo').subscribe(() => {
        becomeArcheo.remove()
    })

    let takeCroissant: ActionMessage
    WA.room.onEnterLayer('croissants').subscribe(() => {
        takeCroissant = WA.ui.displayActionMessage({
            message: utils.translations.translate('utils.executeAction', {action : utils.translations.translate('choice.takeCroissantMessage')}),
            callback: () => {
                const inventorySize = inventory.getInventory().length
                inventory.addToInventory({
                    id: `croissant${inventorySize}`,
                    name: 'Croissant',
                    description: 'choice.looksDelicious',
                    image: 'croissant.png'
                })
            }
        });
    })

    WA.room.onLeaveLayer('croissants').subscribe(() => {
        takeCroissant.remove()
    })

}).catch(e => console.error(e))

export {};
