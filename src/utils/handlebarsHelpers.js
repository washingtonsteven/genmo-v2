import { updateData } from "../state/reducers/followLink";

/**
 * Returns `context.fn(options.genmo.getData())` if we have all the items in `context.hash.items`
 *
 * @param {Object} context Handlebars context object
 * @param {Object} options Options to process inventoryHas
 * @param {Genmo} options.genmo The genmo object to check
 * @param {Boolean} options.inverse Set to true if we should check if we don't have the items
 * @returns {String}
 */
const inventoryHasHelper = (context, options) => {
  if (!options.genmo) {
    return "";
  }

  const items = context.hash["items"].split(/\s+/);

  if (options.inverse) {
    let hasNoItems = true;
    items.forEach((item) => {
      if (options.genmo.hasItem(item)) {
        hasNoItems = false;
      }
    });
    if (hasNoItems) {
      return context.fn(options.genmo.getData());
    }
  } else {
    let hasAllItems = true;
    items.forEach((item) => {
      if (!options.genmo.hasItem(item)) {
        hasAllItems = false;
      }
    });
    if (hasAllItems) {
      return context.fn(options.genmo.getData());
    }
  }

  return "";
};

/**
 * Will go through the Handlebars context, taking all key/value attributes
 * and updating `options.data` with their values (overwriting)
 *
 * @param {Object} context Handlebars Context Object
 * @param {Object} options additional parameters
 * @param {Object} options.data The data object to modify
 * @param {Passage} options.currentPassage The current passage we are modifying, passed in to the helper creator
 * @returns {Object}
 */
const setDataHelper = (context, options) => {
  if (!options.data) {
    return "";
  }

  const dataObj = {};
  Object.keys(context.hash).forEach((key) => {
    let value;
    try {
      value = JSON.parse(context.hash[key]);
    } catch (e) {
      value = context.hash[key];
    }

    dataObj[key] = value;
  });

  updateData(dataObj, {
    data: options.data,
    currentPassage: options.currentPassage,
  });

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
    inventory_has: (context) => inventoryHasHelper(context, { genmo }),
    inventory_not_has: (context) =>
      inventoryHasHelper(context, { genmo, inverse: true }),
  };
};

/**
 * Returns a list of helpers to use when updating data upon following a link
 *
 * @param {Object} data The state's data object. Will be updated in place.
 * @param {Passage} currentPassage The currentPassage object (i.e. the passage we are navigating to)
 * @returns {Object}
 */
export const getDataHelpers = (data, currentPassage) => {
  return {
    data: (context) => setDataHelper(context, { data, currentPassage }),
  };
};
