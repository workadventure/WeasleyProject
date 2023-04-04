import { readRunes, inventory, switchingTiles } from './modules'

WA.onInit().then(() => {
  // Inventory initialisation
  inventory.initiateInventory()

  // Runes reading initialisation
  readRunes.initiateRunesReading()
  readRunes.setRunesReadingZone('runesReading', {content : 'treasureEnigma.runes.content'})

  // Satues enigma setup
  switchingTiles.setSwitchingTile(
    'rotatingStatues',
    () => console.log('OK !'),
    true, // must display action messgae ? (default : false)
    'my.action.translation.key' // translation key of the action message displayed
  )

  // TODO : Faire apparaître le marteau
  // TODO : Fonction pour ramasser le marteau
  // TODO : Fonction qui vérifie qu'on a bien le marteau pour casser les sabliers
  // TODO : Fonction qui casse les sabliers et qui ouvre la porte
  // TODO : Vérifier à l'initialisation de la map si on doit mettre le marteau disponible et/ou ouvrir la porte
})