export type mapVariableType = Record<string, string|number|boolean> | boolean | number | string | null

let callbacks: Record<string, Function> = {}
let oldValue: Record<string, mapVariableType>

const initializeActionForAllPlayers = (id: string, callback: Function, defaultValue: mapVariableType = null) => {
  // Get current value of map action variable
  let currentValue = JSON.parse(WA.state.mapActionVariables as string)

  if (!currentValue[id]) {
    oldValue[id] = defaultValue
    currentValue[id] = defaultValue
    WA.state.mapActionVariables = JSON.stringify(currentValue)
  }

  callbacks[id] = callback
}

const activateActionForAllPlayer = (id: string, value: mapVariableType = null) => {
  let currentValue = JSON.parse(WA.state.mapActionVariables as string)
  if (value === null) {
    currentValue[id] = true
  } else {
    currentValue[id] = value
  }
  WA.state.mapActionVariables = JSON.stringify(currentValue)
}

WA.onInit().then(() => {
  oldValue = JSON.parse(WA.state.mapActionVariables as string)
  WA.state.onVariableChange('mapActionVariables').subscribe((value) => {
    let currentValue = JSON.parse(value as string)
    Object.keys(currentValue).forEach((key) => {
       if (oldValue[key] !== currentValue[key]) {
         if (currentValue[key] !== null) {
           callbacks[key](currentValue[key])
         } else {
           callbacks[key]()
         }
         oldValue[key] = currentValue[key]
       }
    })
  })
})

export {
  initializeActionForAllPlayers,
  activateActionForAllPlayer
}