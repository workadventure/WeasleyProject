const hidePricingButton = () => {
  setTimeout(() => {
    WA.ui.actionBar.removeButton('pricing-btn');
  }, 200)
}

const hideInviteButton = () => {
  setTimeout(() => {
    // TODO : not working
    WA.ui.actionBar.removeButton('invite-btn');
  }, 200)
}

export {
  hidePricingButton,
  hideInviteButton
}