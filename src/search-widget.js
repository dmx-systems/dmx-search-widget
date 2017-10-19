const state = {
  visible: false,           // search widget visibility
  pos: undefined,           // search widget position in `model` and `render` coordinates
                            // (objects with 'x' and 'y' properties)
  extraMenuItems: [],       // Extra type menu items which require special instantiation logic.
  noSelect: false,          // Optional: if trueish the revealed topic will not be selected.
                            // Otherwise it will.
  auxAction: undefined      // Optional: an additional Vuex action (string) that is dispatched subsequently to
                            // "revealTopic". Its payload will be the revealed topic.
                            // If undefined no additional action is dispatched.
}

const actions = {

  /**
   * @param   pos   `model` and `render` coordinates
   */
  openSearchWidget (_, {pos, options}) {
    state.visible = true
    state.pos = pos
    state.noSelect  = options && options.noSelect
    state.auxAction = options && options.auxAction
  },

  closeSearchWidget () {
    state.visible = false
  },

  registerExtraMenuItems (_, items) {
    state.extraMenuItems = [...state.extraMenuItems, ...items]
  }
}

export default {
  state,
  actions
}
