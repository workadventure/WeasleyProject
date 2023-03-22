import * as utils from '../utils'
import {UIWebsite} from "@workadventure/iframe-api-typings";
import {rootLink} from "../config";

export type Job = 'archaeologist' | 'spy'
export type Permissions =
  'useComputers'
  | 'speakAncienLanguages'
  | 'readRunes'
  | 'makeExcavation'
  | 'findSecretPassages'
  | 'makeHooking'

const permissionsByJob: Record<Job, Record<Permissions, boolean>> = {
  archaeologist: {
    useComputers: false,
    speakAncienLanguages: true,
    readRunes: true,
    makeExcavation: true,
    findSecretPassages: false,
    makeHooking: false
  },
  spy: {
    useComputers: true,
    speakAncienLanguages: false,
    readRunes: false,
    makeExcavation: false,
    findSecretPassages: true,
    makeHooking: true
  },
}

// Name of the menubarbutton
const buttonName = 'jobWalletButton'
let jobWalletWebsite: UIWebsite|null = null

// Choose player job
const setPlayerJob = (newJob: Job) => {
  WA.player.state.saveVariable('job', newJob, {public: true})
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
  // Disable controls while card is open
  WA.controls.disablePlayerControls()

  // Open card
  jobWalletWebsite = await WA.ui.website.open({
    url: `${rootLink}/views/jobWallet/jobWallet.html`,
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

  WA.player.state.askForJobWalletWebsiteClose = false
}

const askForJobWalletWebsiteClose = () => {
  WA.player.state.askForJobWalletWebsiteClose = true
}

// Close job wallet website
const closeJobWalletWebsite = () => {
  jobWalletWebsite?.close()
  jobWalletWebsite = null

  // Restore player controle after closing card
  WA.controls.restorePlayerControls()
}

// Show menu bar button for job wallet
const showJobWallet = () => {
  WA.ui.actionBar.addButton({
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

  WA.player.state.onVariableChange('askForJobWalletWebsiteClose').subscribe((value) => {
    if (value) {
      closeJobWalletWebsite()
    }
  })
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
  askForJobWalletWebsiteClose,
}