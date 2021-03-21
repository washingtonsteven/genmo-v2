import { inventoryFilter } from "../../utils/conditionalFilters";
import {
  ACTIONS,
  cloneData,
  SPECIAL_DATA_KEYS,
} from "../../utils/reducerUtils";

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
export const updateInventory = (data, items = null, delta) => {
  if (!data[SPECIAL_DATA_KEYS.INVENTORY]) {
    data[SPECIAL_DATA_KEYS.INVENTORY] = {};
  }
  if (items) {
    if (!Array.isArray(items)) {
      items = [items];
    }
    items.forEach((item) => {
      if (typeof item === "object" && item.condition) {
        if (inventoryFilter(item, data)) {
          data[SPECIAL_DATA_KEYS.INVENTORY][item.name] = Math.max(
            0,
            (data[SPECIAL_DATA_KEYS.INVENTORY][item] || 0) + delta
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
 * If action.type === ACTIONS.UPDATE_INVENTORY.type, updates the inventory with an inventory list in `action.data`
 *
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export function updateInventoryReducer(state, action) {
  if (action.type === ACTIONS.UPDATE_INVENTORY.type) {
    const data = cloneData(state.data);
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
