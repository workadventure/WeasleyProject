/// <reference types="@workadventure/iframe-api-typings" />

import { ActionMessage } from '@workadventure/iframe-api-typings';
import {discussion, inventory, workadventureFeatures} from './modules'
import {getPlayerJob, resetPlayerJob, setPlayerJob, initiateJob} from "./modules/job";
import * as utils from "./utils";
import {rootLink} from "./config";
import { RemotePlayerInterface } from '@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer';

const bannerInviteUser = () => {
    WA.ui.banner.closeBanner();
    WA.ui.banner.openBanner({
        id: "banner-players-not-even",
        text: "You need to be at least 2 players to play this game 🙏",
        closable: false,
        timeToClose: 0
    });
};

const bannerTheTeamIsComplete = () => {
    WA.ui.banner.closeBanner();
    WA.ui.banner.openBanner({
        id: "banner-players-not-even",
        text: "The team is complete, choose your job and let's go to the museum 🚀",
        closable: false,
        timeToClose: 0
    });
};

// Function to determine if all players already have a job
const allPlayersGotJob = async () => {
    const players = WA.players.list();
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
    workadventureFeatures.hidePricingButton();

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
        const players = WA.players.list();
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
                    setPlayerJob('spy');
                    allPlayersGotJob();
                    WA.controls.disablePlayerControls();
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
        const players = WA.players.list();
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
                    setPlayerJob('archaeologist');
                    allPlayersGotJob();
                    WA.controls.disablePlayerControls();
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
    });

    // Door left on choice room
    WA.room.onEnterLayer('door_left_zone').subscribe(() => {
        WA.room.hideLayer('closedoor_left');
        WA.room.showLayer('opendoor_left');
    });
    WA.room.onLeaveLayer('door_left_zone').subscribe(() => {
        WA.room.showLayer('closedoor_left');
        WA.room.hideLayer('opendoor_left');
    });

    WA.room.onEnterLayer('door_right_zone').subscribe(() => {
        WA.room.hideLayer('closedoor_right');
        WA.room.showLayer('opendoor_right');
    });
    WA.room.onLeaveLayer('door_right_zone').subscribe(() => {
        WA.room.showLayer('closedoor_right');
        WA.room.hideLayer('opendoor_right');
    });

    // Get players
    await WA.players.configureTracking()
    WA.players.onPlayerEnters.subscribe(async (player: RemotePlayerInterface) => {
        console.log(`Player ${player.name} entered your nearby zone`);
        if([...WA.players.list()].length === 1) {
            bannerTheTeamIsComplete();
        }else{
            bannerInviteUser();   
        }
    });

    WA.players.onPlayerLeaves.subscribe(async (player: RemotePlayerInterface) => {
        console.log(`Player ${player.name} leave your nearby zone`);
        if([...WA.players.list()].length === 1) {
            bannerTheTeamIsComplete();
        }else{
            bannerInviteUser();   
        }
    });

    const list = WA.players.list()
    if([...list].length === 1) {
        bannerTheTeamIsComplete();
    }else{
        bannerInviteUser();   
    }

}).catch(e => console.error(e))

export {};
