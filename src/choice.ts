/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from '@workadventure/iframe-api-typings';
import {discussion, inventory, workadventureFeatures} from './modules'
import {getPlayerJob, resetPlayerJob, setPlayerJob, initiateJob} from "./modules/job";
import * as utils from "./utils";
import {rootLink} from "./config";

// Get all players on the map (only close players --> here the map is small enough to always get all the players)
const getPlayers = async () => {
    await WA.players.configureTracking()
    return WA.players.list()
}

// Function to determine if all players already have a job
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
WA.onInit().then(async () => {

    const choiceSound = WA.sound.loadSound(`${rootLink}/sounds/choice.mp3`)
    let soundConfig = {
        volume: 0.2,
        loop: true,
        rate: 1,
        detune: 1,
        delay: 0,
        seek: 0,
        mute: false
    }

    choiceSound.play(soundConfig)

    // Initiate inventory
    inventory.initiateInventory()

    // Initiate job
    await initiateJob()

    // Hide pricing
    workadventureFeatures.hidePricingButton()

    // Display scenario
    discussion.openDiscussionWebsite(
      'utils.voiceOver',
      'choice.scenario'
    )

    // When all players have a job, send them to next map
    WA.state.onVariableChange('allPlayersGotJob').subscribe((value) => {
        if(value) {
            choiceSound.stop()
            WA.nav.goToRoom('./museum.tmj')
        }
    })

    // Even if player has already a job set when arriving, we reset his job
    resetPlayerJob()

    // Talk to the NPC
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

    // Choose spy job
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

    // Choose acheologist job
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

    // Take a croissant (useless, but funny)
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
