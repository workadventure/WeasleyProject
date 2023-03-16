import {UIWebsite} from "@workadventure/iframe-api-typings";
import {rootLink} from "../config";


// Name of the menubarbutton
const buttonName = 'discussionButton'
let discussionWebsite: UIWebsite|null = null

// Open job wallet website
const openDiscussionWebsite = async (
    title:string,
    text:string,
    close:string = 'views.choice.close',
    view = "discussion",
    verticalPosition:"top" | "middle" | "bottom" = "middle",
    horizontalPosition: "middle" | "left" | "right" = "middle",
    height = "50vh",
    width = "50vw") => {
  // Disable controls while card is open
  WA.controls.disablePlayerControls()

  // Open card
  discussionWebsite = await WA.ui.website.open({
    url: `${rootLink}/views/discussions/${view}.html?title=${title}&text=${text}&close=${close}`,
    allowApi: true,
    allowPolicy: "",
    position: {
      vertical: verticalPosition,
      horizontal: horizontalPosition,
    },
    size: {
      height: height,
      width: width,
    },
  })
  WA.player.state.askForDiscussionWebsiteClose = false

  WA.player.state.onVariableChange('askForDiscussionWebsiteClose').subscribe((value) => {
    if (value) {
      closeDiscussionWebsite()
    }
  })
}

const askForDiscussionWebsiteClose = () => {
  WA.player.state.askForDiscussionWebsiteClose = true
}

// Close discussion website
const closeDiscussionWebsite = () => {
  discussionWebsite?.close()
  discussionWebsite = null

  // Restore player controle after closing card
  WA.controls.restorePlayerControls()
}

export {
  closeDiscussionWebsite,
  askForDiscussionWebsiteClose,
  openDiscussionWebsite,
  buttonName,
}