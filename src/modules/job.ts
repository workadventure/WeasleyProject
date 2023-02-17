/// <reference types="@workadventure/iframe-api-typings" />
import * as utils from '../utils'

export type Job = 'archaeologist' | 'spy'

// Name of the menubarbutton
const buttonName = 'jobWalletButton'

// Choose player job
const setPlayerJob = (newJob: Job) => {
  WA.player.state.job = newJob
}

// Set player job to null
const resetPlayerJob = () => {
  WA.player.state.job = null
}

// Show menu bar button for job wallet
const showJobWallet = () => {
  WA.ui.actionBar.addButton({ // TODO : doc and types are not the same, see why
    id: buttonName,
    label: utils.translations.translate('modules.job.myJobWallet.label'),
    callback: (event) => {
      console.log('OUVRIR LE WALLET', event);
      // OPEN WALLET HERE // TODO : See how
    }
  });
}

// Hide menu bar button for job wallet
const hideJobWallet = () => {
  WA.ui.actionBar.removeButton(buttonName);
}


const initiateJob = () => {
  if (WA.player.state.job) {
    showJobWallet()
  } else {
    hideJobWallet()
  }

  WA.player.state.onVariableChange('job').subscribe((value) => {
    if (value) {
      console.log(utils.translations.translate('modules.job.jobChanged', {
        job: utils.translations.translate(`modules.job.jobs.${value}`)
      }))
      showJobWallet()
    } else {
      hideJobWallet()
    }
  });

}

export {
  initiateJob,
  setPlayerJob,
  resetPlayerJob
}