export const ACTIONS = {
  FOLLOW_LINK: {
    type: "FOLLOW_LINK",
    link: null
  }
};

export const DIVIDER = "\n---\n";

function followLinkReducer(state, action) {
  if (action.type === ACTIONS.FOLLOW_LINK.type) {
    const currentPassage = action.nextPassage;
    const data = { ...state.data };
    const newDataJSON = (() => {
      const parts = action.nextPassage.text.split(DIVIDER);
      return parts[parts.length - 1];
    })();
    let newData;

    try {
      newData = JSON.parse(newDataJSON);
    } catch (e) {
      if (action.nextPassage.text.split(DIVIDER).length >= 3) {
        console.warn(
          `Couldn't properly parse data for ${currentPassage.name} (${
            currentPassage.pid
          })`
        );
      }
    }

    if (newData) {
      Object.entries(newData).forEach(([key, value]) => {
        const numericMatch = value.match(/^(--|\+\+)(\d+)/);
        if (numericMatch) {
          if (!data[key]) {
            data[key] = 0;
          }
          const operation = numericMatch[1] === "--" ? -1 : 1;
          const abs_delta = +numericMatch[2];
          const delta = abs_delta * operation;

          data[key] += delta;
        } else {
          if (value === "null") {
            data[key] = null;
          } else {
            data[key] = value;
          }
        }
      });
    }

    return {
      ...state,
      currentPassage,
      data
    };
  }
}

export const reducers = [followLinkReducer];
