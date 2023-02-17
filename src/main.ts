/// <reference types="@workadventure/iframe-api-typings" />

import {job} from './modules';

// Waiting for the API to be ready
WA.onInit().then(() => {
    job.initiateJob()
    job.setPlayerJob('archaeologist')
}).catch(e => console.error(e));

export {};
