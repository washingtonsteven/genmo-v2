import { updateData } from "../state/reducers/followLink";
import { updateInventory } from "../state/reducers/updateInventory";

/**
 * Returns `context.fn(options.genmo.getData())` if we have all the items in `context.hash.items`
 *
 * @param {Object} handlebarsOptions Handlebars context object
 * @param {Object} options Options to process inventoryHas
 * @param {Genmo} options.genmo The genmo object to check
 * @param {Boolean} options.inverse Set to true if we should check if we don't have the items
 * @returns {String}
 */
const inventoryHasHelper = (handlebarsOptions, options) => {
  if (!options.genmo) {
    return "";
  }

  const items = handlebarsOptions.hash["items"].split(/\s+/);

  if (options.inverse) {
    let hasNoItems = true;
    items.forEach((item) => {
      if (options.genmo.hasItem(item)) {
        hasNoItems = false;
      }
    });
    if (hasNoItems) {
      return handlebarsOptions.fn(options.genmo.getData());
    }
  } else {
    let hasAllItems = true;
    items.forEach((item) => {
      if (!options.genmo.hasItem(item)) {
        hasAllItems = false;
      }
    });
    if (hasAllItems) {
      return handlebarsOptions.fn(options.genmo.getData());
    }
  }

  return "";
};

/**
 * Will go through the Handlebars context, taking all key/value attributes
 * and updating `options.data` with their values (overwriting)
 *
 * @param {Object} handlebarsOptions Handlebars Context Object
 * @param {Object} options additional parameters
 * @param {Object} options.data The data object to modify
 * @param {Passage} options.currentPassage The current passage we are modifying, passed in to the helper creator
 * @returns {Object}
 */
const setDataHelper = (handlebarsOptions, options) => {
  if (!options.data) {
    return "";
  }

  const dataObj = {};
  Object.keys(handlebarsOptions.hash).forEach((key) => {
    let value;
    try {
      value = JSON.parse(handlebarsOptions.hash[key]);
    } catch (e) {
      value = handlebarsOptions.hash[key];
    }

    if (options.isPassageData) {
      if (!dataObj.passage_data) {
        dataObj.passage_data = {};
      }
      dataObj.passage_data[key] = value;
    } else {
      dataObj[key] = value;
    }
  });

  updateData(dataObj, {
    data: options.data,
    currentPassage: options.currentPassage,
  });

  return options.isPassageData
    ? `passage data set! ${Object.entries(handlebarsOptions.hash)}`
    : "";
};

const updateInventoryHelper = (handlebarsOptions, options) => {
  if (!options.data) {
    return "";
  }

  const delta = options.operation === "remove" ? -1 : 1;

  const itemsList = handlebarsOptions.hash["items"].split(/\s+/);
  const condition = handlebarsOptions.hash["condition"];
  const items = [];
  itemsList.forEach((item) => {
    if (!condition) {
      items.push(item);
    } else {
      items.push({
        name: item,
        condition,
      });
    }
  });

  updateInventory(options.data, items, delta);

  return "";
};

/**
 * Returns a list of helpers to use in parsing passage text.
 *
 * @param {Genmo} genmo The genmo object
 * @returns {Object}
 */
export const getPassageHelpers = (genmo) => {
  return {
    inventory_has: (handlebarsOptions) =>
      inventoryHasHelper(handlebarsOptions, { genmo }),
    inventory_not_has: (handlebarsOptions) =>
      inventoryHasHelper(handlebarsOptions, { genmo, inverse: true }),
  };
};

/**
 * Returns a list of helpers to use when updating data upon following a link.
 *
 * @param {Object} data The state's data object. Will be updated in place.
 * @param {Passage} currentPassage The currentPassage object (i.e. the passage we are navigating to)
 * @returns {Object}
 */
export const getDataHelpers = (data, currentPassage) => {
  return {
    data_set: (handlebarsOptions) =>
      setDataHelper(handlebarsOptions, { data, currentPassage }),
    passage_data_set: (handlebarsOptions) =>
      setDataHelper(handlebarsOptions, {
        data,
        currentPassage,
        isPassageData: true,
      }),
    inventory_add: (handlebarsOptions) =>
      updateInventoryHelper(handlebarsOptions, {
        data,
        currentPassage,
        operation: "add",
      }),
    inventory_remove: (handlebarsOptions) =>
      updateInventoryHelper(handlebarsOptions, {
        data,
        currentPassage,
        operation: "remove",
      }),
  };
};
