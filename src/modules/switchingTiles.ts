const initiateSwitchingTiles = (switchingTiles: Array<string> = ['switchingTiles'], victoryCallBacks: Array<Function>|null = []) => {
  for (let i = 0; i < switchingTiles.length; i++) {
    const victoryCondition = JSON.parse(WA.state[`${switchingTiles[i]}VictoryCondition`] as string)
    const tilesNumber = WA.state[`${switchingTiles[i]}TilesNumber`] as number

    for (let j = 0; j < Object.keys(victoryCondition).length; j++) {
      WA.room.onEnterLayer(`${switchingTiles[i]}/${j}_layer/zone`).subscribe(() => {
        let newValue: number = WA.state[`${switchingTiles[i]}_${j}_value`] ? WA.state[`${switchingTiles[i]}_${j}_value`] as number : 0
        WA.state[`${switchingTiles[i]}_${j}_value`] = (newValue + 1) %  tilesNumber

        if (testVictory(switchingTiles[i], victoryCondition)) {
          // set victory variable so that every user knows
          WA.state[`${switchingTiles[i]}IsVictory`] = true
        }
      })

      // Detect victory
      WA.state.onVariableChange(`${switchingTiles[i]}IsVictory`).subscribe((value) => {
        if (value && victoryCallBacks?.[i]) {
          victoryCallBacks[i]()
        }
      })

      // Change tiles for every user
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