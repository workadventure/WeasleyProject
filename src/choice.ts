/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from '@workadventure/iframe-api-typings';
import {discussion} from './modules'
import {getPlayerJob, resetPlayerJob, setPlayerJob} from "./modules/job";
import * as utils from "./utils";


const getPlayers = async () => {
    await WA.players.configureTracking()
    return WA.players.list()
}

const allPlayersGotJob = async () => {
    const players = await getPlayers()
    for (let player of players) {
        if(!player.state.job) {
            return false
        }
    }
    WA.state.allPlayersGotJob = true
    return true
}



// Waiting for the API to be ready
WA.onInit().then(() => {
    WA.state.onVariableChange('allPlayersGotJob').subscribe((value) => {
        if(value) {
            WA.nav.goToRoom('./map.tmj') // TODO changer la map
        }
    })
    resetPlayerJob()

    let talk: ActionMessage;
    WA.room.onEnterLayer('talk').subscribe(() => {
        talk = WA.ui.displayActionMessage({
            message: utils.translations.translate('modules.choice.talk'),
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
                message: utils.translations.translate('modules.choice.spyMessage') ,
                callback: () => {
                    setPlayerJob('spy')
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
                message: utils.translations.translate('modules.choice.archeoMessage') ,
                callback: () => {
                    setPlayerJob('archaeologist')
                    allPlayersGotJob()
                }
            });
        }
    })
    WA.room.onLeaveLayer('archeo').subscribe(() => {
        becomeArcheo.remove()
    })

}).catch(e => console.error(e))

export {};
