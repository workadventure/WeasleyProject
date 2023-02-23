/// <reference types="@workadventure/iframe-api-typings" />

import {job, excavations} from './modules';

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('INITIALISATION')
    job.initiateJob()
    job.setPlayerJob('archaeologist')


    console.log('HERE')
    excavations.initiateExcavations(['excavation'])
}).catch(e => console.error(e));

export {};
