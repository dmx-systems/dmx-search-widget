const state = {
  visible: false    // true if the search widget is visible
}

const actions = {

  openSearchWidget () {
    state.visible = true
  },

  onSearchWidgetClosed () {
    state.visible = false
  }
}

export default {
  state,
  actions
}
