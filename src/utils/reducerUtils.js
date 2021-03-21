/** @module */

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
  PASSAGE_DATA: "passage_data",
};

/**
 * Clones the `state.data` object, by deeply cloning SPECIAL_DATA_KEYS specifically
 * Otherwise, just using `{ ...state.data }` would result in nested objects,
 * (like `inventory`) persisting their references instead of getting cloned.
 *
 * @param {Object} data
 * @returns {Object}
 * @ignore
 */
export const cloneData = (data) => {
  const newData = {
    ...(data || {}),
  };
  Object.values(SPECIAL_DATA_KEYS).forEach((key) => {
    if (data[key] && Object(data[key]) === data[key]) {
      newData[key] = {
        ...data[key],
      };
    }
  });
  return newData;
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
export const invalidKey = (key) => {
  let invalidKey = false;
  PROTECTED_DATA_KEYS.forEach((protectedKey) => {
    if (key === protectedKey) invalidKey = true;
  });

  return invalidKey;
};

/**
 * @type {String}
 * @description The string used to divide up sections of a passage
 */
export const DIVIDER = "\n---\n";
