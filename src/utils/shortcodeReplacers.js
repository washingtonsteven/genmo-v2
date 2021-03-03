/** @module */
/**
 * @class
 * @property {Genmo} genmo
 */

import { SPECIAL_DATA_KEYS } from "../state/genmoReducers";

/**
 * @typedef {Object} ReplacerParams
 * @property {String} openTag
 * @property {String} tagArgs
 * @property {String} tagContents
 * @property {String} closeTag
 */
class ShortcodeReplacers {
  /**
   *
   * @param {Genmo} genmo
   * @param {Handlebars} Handlebars Handlebars instance from `import Handlebars from 'handlebars'`
   */
  constructor(genmo, Handlebars) {
    this.genmo = genmo;
    const convertibleShortcodes = {
      inventory_has: this.inventoryHas.bind(this),
      "!inventory_has": this.inventoryHas.bind(this),
    };

    Object.entries(convertibleShortcodes).forEach(([shortcode, fn]) => {
      Handlebars.registerHelper(
        shortcode,
        this.createHandlebarsHelper(shortcode, fn)
      );
    });
  }
  /**
   * returns an array of all replacer functions in this class
   * @return {Function[]}
   */
  getReplacers() {
    return [this.inventoryHas.bind(this)];
  }
  /**
   * Generates a Handlerbars helper function based on a Genmo shortcode function
   * @param {String} name
   * @param {Function} fn
   */
  createHandlebarsHelper(name, fn) {
    const thisGenmo = this.genmo; // may not be needed, scoping is weird in this fn
    return (context, options) => {
      return fn({
        openTag: name,
        tagArgs: Object.keys(context).join(" "),
        tagContent: options.fn(thisGenmo.getData()),
        closeTag: name,
      });
    };
  }
  /**
   * Returns `tagContent` in the following conditions:
   * 1. `openTag` is "inventory_has" AND `genmo` has all items listed in `tagArgs` (separated by spaces) OR
   * 2. `openTag` is "!inventory_has" AND `genmo` has none of the items listed in `tagArgs`
   * If these conditions aren't met, returns an empty string.
   *
   * @param {ReplacerParams} replacerParams
   * @return {String}
   */
  inventoryHas({ openTag, tagArgs, tagContent, closeTag }) {
    const items = tagArgs.split(/\s+/);
    if (openTag === "inventory_has") {
      let hasAllItemsInList = true;
      items.forEach((item) => {
        if (!this.genmo.hasItem(item)) {
          hasAllItemsInList = false;
        }
      });
      if (hasAllItemsInList) return tagContent;
    } else if (openTag === "!inventory_has") {
      let doesNotHaveAnyItemsInList = true;
      items.forEach((item) => {
        if (this.genmo.hasItem(item)) {
          doesNotHaveAnyItemsInList = false;
        }
      });
      if (doesNotHaveAnyItemsInList) return tagContent;
    }

    return "";
  }
}

export { ShortcodeReplacers };
