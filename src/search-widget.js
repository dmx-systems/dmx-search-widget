const state = {
  visible: false,     // true if the search widget is visible
  pos: {}
}

const actions = {

  openSearchWidget (_, pos) {
    state.visible = true
    state.pos = pos
  },

  onSearchWidgetClosed () {
    state.visible = false
  }
}

export default {
  state,
  actions
}
