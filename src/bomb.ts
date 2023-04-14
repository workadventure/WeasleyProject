import {UIWebsite} from "@workadventure/iframe-api-typings";
import {rootLink} from "./config";

let bombWebsite:UIWebsite|null = null

WA.onInit().then(() => {
  WA.room.onEnterLayer('bombZone').subscribe(async () => {
    WA.controls.disablePlayerControls();

    // Open card
    bombWebsite = await WA.ui.website.open({
      url: `${rootLink}/views/bomb/bomb.html`,
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
  })
})