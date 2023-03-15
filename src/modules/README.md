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
    - TODO
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