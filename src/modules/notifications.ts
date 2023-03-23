import {UIWebsite} from "@workadventure/iframe-api-typings";
import {rootLink} from "../config";

type notificationType = 'info'|'error'|'success'|'warning'


let notificationWebsite: Array<UIWebsite> = []

// This function will display a notification message to the user :
// - content : the translation key of the content of the notification
// - title : the translation key of the title of the notification
// - type : the type of the notification (error, info, success, warning)
const notify = async (content: string, title: string|null = null, type: notificationType = 'info') => {
  notificationWebsite.push(await openNotification(content, title, type))
  setTimeout(() => {
    if (notificationWebsite[0]) {
      const notification = notificationWebsite.shift() as UIWebsite
      notification.close()
    }
  }, 2000) // Stay two seconds on screen
}

const openNotification = async (content: string, title: string|null, type: notificationType) => {
  return await WA.ui.website.open({
    url: `${rootLink}/views/notifications/notification.html?content=${content}&title=${title}&type=${type}&index=${notificationWebsite.length}`,
    allowApi: true,
    allowPolicy: "",
    position: {
      vertical: "top",
      horizontal: "right",
    },
    size: {
      height: "100vh",
      width: "20vw",
    },
  })
}

export {
  notify
}