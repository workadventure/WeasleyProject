# How to use modules

## Switching tiles
### Description
This module is used to put groups of tiles composed of several tiles whose design can be changed by walking on it.
You can determine a victory condition, which allows to trigger a callback
(**example :** When the displayed drawings are those expected, a door opens)

### Map setup
In your map, on Tiled, you must create a group of layers with the name of your choice.
In this group:
- As many layer groups as you want tiles (in this file it's called **switchingTileGroup**)
  - Each one must be called "[no]_layer" (**ex :** "1_layer")
  - Each one must contain one layer called "zone". This is the area that, when the player steps on it, will change the drawing of the switchingTileGroup.
  - Each one must contain as many layers (in this file it's called **drawingLayer**) as you have drawings (one layer = one drawing). Call it with a numero (the numero if the drawing you want to display). You must place the tiles on each layer at the place you want it to be
- you must create an object layer named "variables" with :
  - A variable named **"[name_of_your_group]VictoryCondition"** (ex: if your group name is **"switchingTiles"**, then the variable name is **"switchingTilesVictoryCondition"**)
    - Type : string
    - Default value : A json string containing your victory condition
    - `{ [drawingLayer_no]: [drawing_no] }`
    - ex : `{ "0" : "1", "1" : "2" }`
  - A variable named **"[name_of_your_group]TilesNumber"** (ex: if your group name is **"switchingTiles"**, then the variable name is **"switchingTilesTilesNumber"**)
    - Type : number
    - Default value : Number of differents drawing for the tiles
  - A variable named **"[name_of_your_group]IsVictory"** (ex: if your group name is **"switchingTiles"**, then the variable name is **"switchingTilesIsVictory"**)
      - Type : Boolean
      - Default value : false
  - As many variables as you have switchingTileGroups called "switchingTiles_[switchingTileGroup_no]_value"
    - Type: number
    - Default value : The drawingLayer no that you want to be showed at first for this switchingTileGroup


  ![](../../readme_images/switchingTilesDirectoryTree.png)
### Code setup
In map's script :

```typescript
import { switchingTiles } from './modules'

// Waiting for the API to be ready
WA.onInit().then(() => {
  // Parameters:
    // switchingTiles: Array<string> --> List of switching tiles groups names
    // victoryCallBacks: Array<Function> --> List of callbacks to call when victory for each group
  switchingTiles.initiateSwitchingTiles(
    ['switchingTiles'], 
    [() => console.log('OK !')
  ])
})
```


## Hidden Zones
### Description
This module is used to erase a layer when you walk in a specific area, and to display it again when you leave it.
This can be useful, for example, if you want to make rooms inside buildings that you can't see from the outside.

### Map setup
You must create two layers (name it as you want): 
- A layer that will be used to hide the other layer when walking on it
- The other layer that will desapear when walking on the first one (NOTE : you can make a group with several layers if needed)

### Code setup
In order to initiate hidden zones, you must use hiddenZone module in your map's script.
You must call the function **initiateHiddenZones** and give it as parameter an array of objects with type hiddenZoneType : 
```typescript
type hiddenZoneType = {
  stepIn: string,
  hide: string
}
```

This type is composed by two strings : 
- stepIn : the name of the first layer (hide the other layer when walking on it)
- hide : the name of the second layer (or the name of the group of layer) that will be hidden

In your map's script : 

```typescript
import { hiddenZone } from './modules'

WA.onInit().then(() => {
  hiddenZone.initiateHiddenZones([{stepIn: 'stepInZoneName', hide: 'hideZoneName'}])
})
```