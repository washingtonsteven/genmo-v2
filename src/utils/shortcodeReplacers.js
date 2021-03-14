/** @module */
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
   * Sets up custom shortcodes and Custom Block Helpers in Handlerbars
   * @param {Genmo} genmo
   * @param {Handlebars} Handlebars Handlebars instance from `import Handlebars from 'handlebars'`
   */
  constructor(genmo, Handlebars) {
    this.genmo = genmo;
    const convertibleShortcodes = {
      inventory_has: { fn: this.inventoryHas.bind(this), argName: "items" },
      inventory_not_has: { fn: this.inventoryHas.bind(this), argName: "items" },
      changed: { fn: this.dataChanged.bind(this), argName: "keys" },
    };

    Object.entries(convertibleShortcodes).forEach(
      ([shortcode, { fn, argName }]) => {
        Handlebars.registerHelper(
          shortcode,
          this.createHandlebarsHelper(shortcode, fn, argName)
        );
      }
    );
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
   * @param {String} [argName]
   */
  createHandlebarsHelper(name, fn, argName) {
    // docs say that `context` should be the second arg (the first being `options` which has `fn`)
    // i.e. (options, context) => options.fn()
    // see: https://handlebarsjs.com/guide/block-helpers.html#the-with-helper
    // inspecing during tests shows that it's `context.fn` instead. It's weird.
    return (context) => {
      return fn({
        openTag: name,
        tagArgs: argName ? context.hash[argName] : "",
        tagContent: context.fn(this.genmo.getData()),
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
   * Alternate form of "!inventory_has" is "inventory_not_has", since Handlebars doesn't like starting with !
   * // potential TODO: actually implement detecting !
   *
   * @param {ReplacerParams} replacerParams
   * @return {String}
   */
  inventoryHas({ openTag, tagArgs, tagContent }) {
    const items = tagArgs.split(/\s+/);
    if (openTag === "inventory_has") {
      let hasAllItemsInList = true;
      items.forEach((item) => {
        if (!this.genmo.hasItem(item)) {
          hasAllItemsInList = false;
        }
      });
      if (hasAllItemsInList) return tagContent;
    } else if (
      openTag === "!inventory_has" ||
      openTag === "inventory_not_has"
    ) {
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
  /**
   * Returns `replacerParams.tagContent` if all of the keys specified in `tagArgs` (space-separated list)
   * changed in the last update. Compares primitives with strict equality, compares objects via `JSON.stringify`
   *
   * @param {ReplacerParams} replacerParams
   * @returns {String}
   */
  dataChanged({ tagArgs, tagContent }) {
    const keys = tagArgs.split(/\s+/);
    const currentState = this.genmo.state;
    const prevState = this.genmo.getPreviousState();
    let dataHasChanged = true;
    keys.forEach((key) => {
      const prevValue = prevState.data[key];
      const currentValue = currentState.data[key];
      if (
        currentValue !== Object(currentValue) ||
        prevValue !== Object(prevValue)
      ) {
        if (currentValue === prevValue) dataHasChanged = false;
      } else {
        if (JSON.stringify(prevValue) === JSON.stringify(currentValue))
          dataHasChanged = false;
      }
    });

    return dataHasChanged ? tagContent : "";
  }
}

export { ShortcodeReplacers };
