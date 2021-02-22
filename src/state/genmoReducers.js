export const ACTIONS = {
  FOLLOW_LINK: {
    type: "FOLLOW_LINK",
    link: null,
  },
  PROMPT_ANSWER: {
    type: "PROMPT_ANSWER",
    data: {},
  },
  UPDATE_INVENTORY: {
    type: "UPDATE_INVENTORY",
    items: {},
  },
};

export const SPECIAL_DATA_KEYS = {
  INVENTORY: "inventory",
  INVENTORY_ADD: "inventory_add",
  INVENTORY_REMOVE: "inventory_remove",
};

export const PROTECTED_DATA_KEYS = [SPECIAL_DATA_KEYS.INVENTORY];

const invalidKey = (key) => {
  let invalidKey = false;
  PROTECTED_DATA_KEYS.forEach((protectedKey) => {
    if (key === protectedKey) invalidKey = true;
  });

  return invalidKey;
};

// Modifies `data` in place to add an inventory key
const updateInventory = (data, items = null, delta) => {
  if (!data[SPECIAL_DATA_KEYS.INVENTORY]) {
    data[SPECIAL_DATA_KEYS.INVENTORY] = {};
  }
  if (items) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    items.forEach((item) => {
      // Initialize if it doesn't exist
      if (
        !data[SPECIAL_DATA_KEYS.INVENTORY][item] &&
        data[SPECIAL_DATA_KEYS.INVENTORY][item] !== 0
      ) {
        data[SPECIAL_DATA_KEYS.INVENTORY][item] = 0;
      }

      // apply given delta
      data[SPECIAL_DATA_KEYS.INVENTORY][item] =
        data[SPECIAL_DATA_KEYS.INVENTORY][item] + delta;
    });
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
          `Couldn't properly parse data for '${currentPassage.name}' (${currentPassage.pid})`
        );
      }
    }

    if (newData) {
      Object.entries(newData).forEach(([key, value]) => {
        if (invalidKey(key)) {
          console.warn(
            `When parsing passage data for '${currentPassage.name}' (${currentPassage.pid}), we tried to access a protected key: ${key}`
          );
          return;
        }
        const numericMatch =
          typeof value === "string" && value.match(/^(--|\+\+)(\d+)/);
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
          } else if (value === ">>") {
            if (!data[key]) {
              if (!currentPassage.needsPrompt) currentPassage.needsPrompt = [];
              const keyIndex = currentPassage.needsPrompt.findIndex(
                (p) => p.key === key
              );

              if (keyIndex < 0) currentPassage.needsPrompt.push({ key });
            }
          } else if (key === SPECIAL_DATA_KEYS.INVENTORY_ADD) {
            updateInventory(data, value, 1);
          } else if (key === SPECIAL_DATA_KEYS.INVENTORY_REMOVE) {
            updateInventory(data, value, -1);
          } else {
            data[key] = value;
          }
        }
      });
    }

    return {
      ...state,
      currentPassage,
      data,
    };
  }

  return {
    ...state,
  };
}

function promptAnswerReducer(state = {}, action) {
  if (action.type === ACTIONS.PROMPT_ANSWER.type) {
    const newState = {
      ...state,
    };
    const targetPassage = newState.storyData.passages.find(
      (p) => p.pid === action.pid
    );

    targetPassage.needsPrompt = targetPassage.needsPrompt.map((prompt) => {
      if (prompt.key === action.key) {
        return { ...prompt, complete: true };
      }
      return prompt;
    });

    newState.currentPassage = targetPassage;

    newState.data = {
      ...newState.data,
      [action.key]: action.value,
    };

    return newState;
  }

  return {
    ...state,
  };
}

function updateInventoryReducer(state, action) {
  if (action.type === ACTIONS.UPDATE_INVENTORY.type) {
    const data = { ...state.data };
    Object.entries(action.items).forEach(([key, value]) => {
      updateInventory(data, key, value);
    });
    return {
      ...state,
      data,
    };
  }

  return {
    ...state,
  };
}

export const reducers = [
  followLinkReducer,
  promptAnswerReducer,
  updateInventoryReducer,
];
