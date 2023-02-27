/// <reference types="../../node_modules/@workadventure/iframe-api-typings" />
import * as utils from '../../src/utils/index.js'
import * as modules from '../../src/modules/index.js'

const getTitle = () => {
  return utils.translations.translate(`views.jobWallet.title`, {
    job: utils.translations.translate(`views.jobWallet.jobs.${modules.job.getPlayerJob()}.name`)
  })
}

const getAttributes = () => {
  return utils.translations.translate(`views.jobWallet.jobs.${modules.job.getPlayerJob()}.attributes`, {
    name: WA.player.name
  })
}

const getDescription = () => {
  return utils.translations.translate(`views.jobWallet.jobs.${modules.job.getPlayerJob()}.description`)
}

const getPermissions = () => {
  const ul = document.createElement('ul')
  const permissions = modules.job.getUserPermissions()
  for (let i = 0; i < permissions.length; i++) {
    const li = document.createElement('li')
    li.innerHTML = utils.translations.translate(
      `views.jobWallet.jobs.${modules.job.getPlayerJob()}.permissions.${permissions[i]}`
    )
    ul.appendChild(li)
  }
  return ul
}

const getCloseJobWalletWebsiteButtonText = () => {
  return utils.translations.translate(`views.jobWallet.close`)
}

const closeJobWalletWebsite = () => {
  modules.job.askForJobWalletWebsiteClose()
}

export {
  getTitle,
  getAttributes,
  getDescription,
  getPermissions,
  closeJobWalletWebsite,
  getCloseJobWalletWebsiteButtonText
}