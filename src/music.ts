/// <reference types="@workadventure/iframe-api-typings" />
import {arrayFilling, discussion} from './modules'
import {ActionMessage} from "@workadventure/iframe-api-typings";
import * as utils from "./utils";

WA.onInit().then(() => {

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

        const soundsPath = '/sounds/'
        const soundConfig = {
            volume: 1,
            loop: false,
            rate: 1,
            detune: 1,
            delay: 0,
            seek: 0,
            mute: false
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
                    WA.nav.goToRoom('./music.tmj')
                }
            },
            () => {
                WA.state.victory = true
                removeTiles()
            }
        )

        const doSound = WA.sound.loadSound(`${soundsPath}do.mp3`);
        const reSound = WA.sound.loadSound(`${soundsPath}re.mp3`);
        const miSound = WA.sound.loadSound(`${soundsPath}mi.mp3`);
        const faSound = WA.sound.loadSound(`${soundsPath}fa.mp3`);
        const solSound = WA.sound.loadSound(`${soundsPath}sol.mp3`);
        const laSound = WA.sound.loadSound(`${soundsPath}la.mp3`);
        const siSound = WA.sound.loadSound(`${soundsPath}si.mp3`);

        console.log(WA.state.victory)

        WA.room.onEnterLayer('notes/do').subscribe(() => {
            if (!WA.state.victory) {
                doSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'do')
            }
        })
        WA.room.onEnterLayer('notes/re').subscribe(() => {
            if (!WA.state.victory) {
                reSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 're')
            }
        })
        WA.room.onEnterLayer('notes/mi').subscribe(() => {
            if (!WA.state.victory) {
                miSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'mi')
            }
        })
        WA.room.onEnterLayer('notes/fa').subscribe(() => {
            if (!WA.state.victory) {
                faSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'fa')
            }
        })
        WA.room.onEnterLayer('notes/sol').subscribe(() => {
            if (!WA.state.victory) {
                solSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'sol')
            }
        })
        WA.room.onEnterLayer('notes/la').subscribe(() => {
            if (!WA.state.victory) {
                laSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'la')
            }
        })
        WA.room.onEnterLayer('notes/si').subscribe(() => {
            if (!WA.state.victory) {
                siSound.play(soundConfig);
                arrayFilling.testArrayFilling('musicTiles', 'si')
            }
        })

        let infos: ActionMessage;
        WA.room.onEnterLayer('infos').subscribe(() => {
            infos = WA.ui.displayActionMessage({
                message: utils.translations.translate('utils.executeAction', {action: utils.translations.translate('music.display')}),
                callback: () => {
                    discussion.openDiscussionWebsite('views.music.title', 'views.music.text')
                }
            });
        })
        WA.room.onLeaveLayer('infos').subscribe(() => {
            infos.remove()
        })
    }
})

export {};