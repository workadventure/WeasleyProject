
const initiateSwitchingTiles = (switchingTiles: Array<string> = ['switchingTiles']) => {
  for (let i = 0; i < switchingTiles.length; i++) {
    const victoryCondition = JSON.parse(WA.state[`${switchingTiles[i]}VictoryCondition`] as string)

    for (let j = 0; j < Object.keys(victoryCondition).length; j++) {
      console.log(`${switchingTiles[i]}/${j}_layer/zone`)
      WA.room.onEnterLayer(`${switchingTiles[i]}/${j}_layer/zone`).subscribe(() => {
        let newValue: number = WA.state[`${switchingTiles[i]}_${j}_value`] ? WA.state[`${switchingTiles[i]}_${j}_value`] as number : 0
        WA.state[`${switchingTiles[i]}_${j}_value`] = (newValue + 1) %  3 // TODO : store length in variable ?
      })

      WA.state.onVariableChange(`${switchingTiles[i]}_${j}_value`).subscribe(() => {
        WA.room.hideLayer(`${switchingTiles[i]}/${j}_layer`)
        WA.room.showLayer(`${switchingTiles[i]}/${j}_layer/${WA.state[`${switchingTiles[i]}_${j}_value`]}`)
      })
    }
  }
}

export {
  initiateSwitchingTiles
}