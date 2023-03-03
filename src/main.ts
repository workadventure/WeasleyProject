/// <reference types="@workadventure/iframe-api-typings" />

import {job, excavations, lobby, secretPassages, hiddenZone} from './modules';

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('INITIALISATION')
    job.initiateJob()
    job.setPlayerJob('spy')

    console.log('HERE')
    excavations.initiateExcavations(['excavation'], [() => {console.log('test callback after excavation')}])
    secretPassages.initiateSecretPassages(['secretPassage'], [() => {console.log('test callback after finding secret passage')}])
    hiddenZone.initiateHiddenZones([{stepIn: 'hiddenZoneFloor', hide: 'hiddenZoneTop'}])

    console.log('LOBBY INITIALISATION')
    lobby.initiateLobby()
}).catch(e => console.error(e));

export {};
