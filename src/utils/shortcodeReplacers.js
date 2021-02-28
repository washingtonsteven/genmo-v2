/**
 * @class
 * @property {Genmo} genmo
 */

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
   */
  constructor(genmo) {
    this.genmo = genmo;
  }
  /**
   * returns an array of all replacer functions in this class
   * @return {Function[]}
   */
  getReplacers() {
    return [this.inventoryHas.bind(this)];
  }
  /**
   * Returns `tagContent` in the following conditions:
   * 1. `openTag` is "inventory_has" AND `genmo` has all items listed in `tagArgs` (separated by spaces) OR
   * 2. `openTag` is "!inventory_has" AND `genmo` has none of the items listed in `tagArgs`
   * If these conditions aren't met, returns an empty string.
   *
   * @param {ReplacerParams} replacerParams
   * @return {STring}
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
