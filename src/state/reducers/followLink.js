import {
  ACTIONS,
  cloneData,
  invalidKey,
  DIVIDER,
  SPECIAL_DATA_KEYS,
} from "../../utils/reducerUtils";
import {
  InvalidDataKeyError,
  InvalidPassageDataError,
} from "../../utils/errors";
import { updateInventory } from "./updateInventory";

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
export function followLinkReducer(state, action) {
  if (action.type !== ACTIONS.FOLLOW_LINK.type) {
    return {
      ...state,
    };
  }

  const currentPassage = action.nextPassage;
  const data = cloneData(state.data);
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
      }

      if (value === "null") {
        data[key] = null;
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
      }

      if (value === ">>") {
        if (!data[key]) {
          if (!currentPassage.needsPrompt) currentPassage.needsPrompt = [];
          const keyIndex = currentPassage.needsPrompt.findIndex(
            (p) => p.key === key
          );

          if (keyIndex < 0) currentPassage.needsPrompt.push({ key });
        }
      }

      if (key === SPECIAL_DATA_KEYS.INVENTORY_ADD) {
        updateInventory(data, value, 1);
      }

      if (key === SPECIAL_DATA_KEYS.INVENTORY_REMOVE) {
        updateInventory(data, value, -1);
      }

      try {
        data[key] = JSON.parse(value);
      } catch (e) {}
    });
  }

  // Reset passage data if we didn't already set it above
  if (
    !newData ||
    !Object.keys(newData).find((k) => k === SPECIAL_DATA_KEYS.PASSAGE_DATA)
  ) {
    data[SPECIAL_DATA_KEYS.PASSAGE_DATA] = {};
  }

  return {
    ...state,
    currentPassage,
    data,
  };
}
