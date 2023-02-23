import * as utils from '../utils'
import {UIWebsite} from "@workadventure/iframe-api-typings";

export type Job = 'archaeologist' | 'spy'
export type Permissions =
  'useComputers'
  | 'speakAncienLanguages'
  | 'readRunes'
  | 'makeExcavation'
  | 'findSecretPassages'

const permissionsByJob: Record<Job, Record<Permissions, boolean>> = {
  archaeologist: {
    useComputers: false,
    speakAncienLanguages: true,
    readRunes: true,
    makeExcavation: true,
    findSecretPassages: false
  },
  spy: {
    useComputers: true,
    speakAncienLanguages: false,
    readRunes: false,
    makeExcavation: false,
    findSecretPassages: true
  }
}

// Name of the menubarbutton
const buttonName = 'jobWalletButton'
let jobWalletWebsite: UIWebsite|null = null

// Choose player job
const setPlayerJob = (newJob: Job) => {
  WA.player.state.job = newJob
}

const getPlayerJob = () => {
  return WA.player.state.job
}

// Set player job to null
const resetPlayerJob = () => {
  WA.player.state.job = null
}

// Open job wallet website
const openJobWalletWebsite = async () => {
  jobWalletWebsite = await WA.ui.website.open({
    url: 'http://localhost:5173/views/jobWallet/jobWallet.html?name=test', // TODO : See how relative path ? --> Make config file with root ?
    allowApi: true,
    allowPolicy: "",
    position: {
      vertical: "middle",
      horizontal: "middle",
    },
    size: {
      height: "50vh",
      width: "50vw",
    },
  })
}

// Close job wallet website
const closeJobWalletWebsite = () => {
  jobWalletWebsite?.close()
  jobWalletWebsite = null
}

// Show menu bar button for job wallet
const showJobWallet = () => {
  WA.ui.actionBar.addButton({ // TODO : doc and types are not the same, see why
    id: buttonName,
    label: utils.translations.translate('modules.job.myJobWallet.label'),
    callback: async () => {
      if (!jobWalletWebsite) {
        await openJobWalletWebsite()
      } else {
        closeJobWalletWebsite()
      }
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

// See if user has the permission passed as parameter
const canUser = (permissionName: Permissions) => {
  return WA.player.state.job && permissionsByJob[WA.player.state.job as Job][permissionName]
}

// Get a list of user permissions
const getUserPermissions = () => {
  if (WA.player.state.job && permissionsByJob[WA.player.state.job as Job]) {
    return Object.keys(permissionsByJob[WA.player.state.job as Job]).filter((item) => {
      return permissionsByJob[WA.player.state.job as Job][item as Permissions]
    })
  }
  return null
}

export {
  initiateJob,
  setPlayerJob,
  getPlayerJob,
  resetPlayerJob,
  canUser,
  getUserPermissions,
  closeJobWalletWebsite,
}