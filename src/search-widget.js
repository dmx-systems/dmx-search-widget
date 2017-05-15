const state = {
  visible: false,     // true if the search widget is visible
  pos: {}             // search widget position (object with 'x' and 'y' properties)
}

const actions = {

  openSearchWidget (_, pos) {
    state.visible = true
    state.pos = pos
  },

  closeSearchWidget () {
    state.visible = false
  }
}

export default {
  state,
  actions
}
