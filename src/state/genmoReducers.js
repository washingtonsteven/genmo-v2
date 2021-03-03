/** @module */
import { inventoryFilter } from "../utils/conditionalFilters";
import { InvalidDataKeyError, InvalidPassageDataError } from "../utils/errors";

/**
 * @type {Object}
 * @description A list of basic actions, which can be merged with data to create a full action
 * e.g const MY_FOLLOW_ACTION = { ...ACTIONS.FOLLOW_LINK, link:"1" }
 *
 * @property {Object} FOLLOW_LINK
 * @property {String} FOLLOW_LINK.type
 * @property {Link} FOLLOW_LINK.link
 *
 * @property {Object} PROMPT_ANSWER
 * @property {String} PROMPT_ANSWER.type
 * @property {String} PROMPT_ANSWER.key
 * @property {String} PROMPT_ANSWER.value
 * @property {Pid} PROMPT_ANSWER.pid
 *
 * @property {Object} UPDATE_INVENTORY
 * @property {String} UPDATE_INVENTORY.type
 * @property {Object} UPDATE_INVENTORY.items
 *
 * @property {Object} SET_DATA
 * @property {String} SET_DATA.type
 * @property {Object} SET_DATA.data
 */
export const ACTIONS = {
  FOLLOW_LINK: {
    type: "FOLLOW_LINK",
    link: null,
  },
  PROMPT_ANSWER: {
    type: "PROMPT_ANSWER",
    key: "",
    value: "",
    pid: "",
  },
  UPDATE_INVENTORY: {
    type: "UPDATE_INVENTORY",
    items: {},
  },
  SET_DATA: {
    type: "SET_DATA",
    data: {},
  },
};

/**
 * @type {Object}
 * @description A list of special keys that could exist in Genmo's custom data. Kept here to lower the # of "magic strings" in the code
 * @ignore
 */
export const SPECIAL_DATA_KEYS = {
  INVENTORY: "inventory",
  INVENTORY_ADD: "inventory_add",
  INVENTORY_REMOVE: "inventory_remove",
};

/**
 * @type {String[]}
 * @description A list of keys that should not be overwritten by in-passage data.
 */
export const PROTECTED_DATA_KEYS = [SPECIAL_DATA_KEYS.INVENTORY];

/**
 * Returns whether the key is okay to use (based on PROTECTED_DATA_KEYS)
 * @param {String} key
 * @ignore
 */
const invalidKey = (key) => {
  let invalidKey = false;
  PROTECTED_DATA_KEYS.forEach((protectedKey) => {
    if (key === protectedKey) invalidKey = true;
  });

  return invalidKey;
};

/**
 * @typedef {Object} ConditionalInventoryItem
 * @property {String} condition
 * @property {String} name
 */

/**
 * Updates `data` in place to add/remove `items` based on the given `delta`.
 * This will create the inventory on the data object if it does not already exist.
 * This will also prevent any item's quantity from going below zero.
 *
 * If there is an object within `items` with a key `condition`, it will be considered before adding/removing the item.
 *
 * @param {Object} data
 * @param {(String[]|ConditionalInventoryItem[])} items
 * @param {Number} delta
 */
const updateInventory = (data, items = null, delta) => {
  if (!data[SPECIAL_DATA_KEYS.INVENTORY]) {
    data[SPECIAL_DATA_KEYS.INVENTORY] = {};
  }
  if (items) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    items.forEach((item) => {
      if (typeof item === "object" && item.condition) {
        const f = inventoryFilter;
        if (inventoryFilter(item, data)) {
          data[SPECIAL_DATA_KEYS.INVENTORY][item.name] = Math.max(
            0,
            data[SPECIAL_DATA_KEYS.INVENTORY][item] + delta
          );
        }
      } else if (typeof item === "string") {
        // Initialize if it doesn't exist
        // apply given delta
        data[SPECIAL_DATA_KEYS.INVENTORY][item] = Math.max(
          0,
          (data[SPECIAL_DATA_KEYS.INVENTORY][item] || 0) + delta
        );
      }
    });
  }
};

/**
 * @type {String}
 * @description The string used to divide up sections of a passage
 */
export const DIVIDER = "\n---\n";

/**
 * Updates the state to point currentPassage to action.link (if action.type === ACTIONS.FOLLOW_LINK.type)
 * This will also check if the link is valid, apply any data to the state from the new passage, and request prompts for the passage as indicated.
 *
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 * @throws {InvalidPassageDataError}
 * @throws {InvalidDataKeyError}
 */
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
        throw new InvalidPassageDataError({
          currentPassage,
        });
      }
    }

    if (newData) {
      Object.entries(newData).forEach(([key, value]) => {
        if (invalidKey(key)) {
          throw new InvalidDataKeyError({
            currentPassage,
            key,
          });
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

/**
 * If `action.type === ACTION.PROMPT_ANSWER.type`, this will take `action.key` and set it to `action.value`,
 * as well as updating the `needsPrompt` key in the passage to indicate that this prompt has been fulfilled.
 *
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
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

/**
 * If action.type === ACTIONS.UPDATE_INVENTORY.type, updates the inventory with an inventory list in `action.data`
 *
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
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

/**
 * If action.type === ACTIONS.SET_DATA.type, takes `action.data` and sets it to `state.data`
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
function setDataReducer(state, action) {
  if (action.type === ACTIONS.SET_DATA.type) {
    const data = { ...state.data } || {};
    Object.entries(action.data).forEach(([key, value]) => {
      data[key] = value;
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

/** @type {Function[]}
 * @description a list of all reducers, to be registered with Genmo at once
 * @ignore
 */
export const reducers = [
  followLinkReducer,
  promptAnswerReducer,
  updateInventoryReducer,
  setDataReducer,
];
