
const initiateSwitchingTiles = (switchingTiles: Array<string> = ['switchingTiles']) => {
  for (let i = 0; i < switchingTiles.length; i++) {
    const victoryCondition = JSON.parse(WA.state[`${switchingTiles[i]}VictoryCondition`] as string)
    const tilesNumber = 3 // TODO :  from variable ?

    for (let j = 0; j < Object.keys(victoryCondition).length; j++) {
      console.log(`${switchingTiles[i]}/${j}_layer/zone`)
      WA.room.onEnterLayer(`${switchingTiles[i]}/${j}_layer/zone`).subscribe(() => {
        let newValue: number = WA.state[`${switchingTiles[i]}_${j}_value`] ? WA.state[`${switchingTiles[i]}_${j}_value`] as number : 0
        WA.state[`${switchingTiles[i]}_${j}_value`] = (newValue + 1) %  tilesNumber

        // TODO : Test victory
        if (testVictory(switchingTiles[i], victoryCondition)) {
          console.log('VICTORY')
        }
      })

      WA.state.onVariableChange(`${switchingTiles[i]}_${j}_value`).subscribe(() => {
        WA.room.hideLayer(`${switchingTiles[i]}/${j}_layer`)
        WA.room.showLayer(`${switchingTiles[i]}/${j}_layer/${WA.state[`${switchingTiles[i]}_${j}_value`]}`)
      })
    }
  }
}

const testVictory = (switchingTilesName: string, victoryConditions: Record<string, number>) => {
  for (let i = 0; i < Object.keys(victoryConditions).length; i++ ) {
    if (WA.state[`${switchingTilesName}_${i}_value`] != victoryConditions[i]) {
      return false
    }
  }
  return true
}

export {
  initiateSwitchingTiles
}