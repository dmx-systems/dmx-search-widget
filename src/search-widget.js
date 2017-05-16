const state = {
  visible: false,     // true if the search widget is visible
  pos: {}             // search widget position in `model` and `render` coordinates
                      // (2 objects with 'x' and 'y' properties)
}

const actions = {

  /**
   * @param   pos   `model` and `render` positions
   */
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
