export const ACTIONS = {
  FOLLOW_LINK: {
    type: "FOLLOW_LINK",
    link: null
  }
};

function followLinkReducer(state, action) {
  if (action.type === ACTIONS.FOLLOW_LINK.type) {
    return {
      ...state,
      currentPassage: action.nextPassage
    };
  }
}

export const reducers = [followLinkReducer];
