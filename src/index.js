import StatefulComponent from "./state/statefulComponent";
import {
  ACTIONS as actions,
  cloneData,
  DIVIDER,
  SPECIAL_DATA_KEYS,
} from "./utils/reducerUtils";
import { reducers } from "./state/genmoReducers";
import { linkFilter } from "./utils/conditionalFilters";
import {
  InvalidLinkError,
  InvalidStoryError,
  LinkNotFoundError,
  PassageNotFoundError,
} from "./utils/errors";
import { getDataHelpers, getPassageHelpers } from "./utils/handlebarsHelpers";
import Handlebars from "handlebars";

/**
 * @typedef {String} Pid Number string identifier for a passage
 */
/**
 * @typedef {Object} Link
 * @property {String} name The display text for the link
 * @property {String} link Name of the passage this link links to
 * @property {Pid} pid
 */
/**
 * @typedef {Object} Prompt
 * @property {String} key
 * @property {Boolean} complete
 */
/**
 * @typedef {Object} Passage
 * @property {String} text Full text for the passage
 * @property {String} passageText The main text for the passage
 * @property {Link[]} links
 * @property {String} name
 * @property {Pid} pid
 * @property {Object} position
 * @property {String} position.x
 * @property {String} position.y
 * @property {Prompt[]} [needsPrompt]
 */
/**
 * @typedef {Object} StoryData
 * @property {Passage[]} passages
 * @property {String} name
 * @property {Pid} startnode
 * @property {String} creator
 * @property {String} creator-version
 * @property {String} ifid
 */
/**
 * @typedef {Object} GenmoOptions
 * @property {Function} outputFunction
 * @property {Function} errorFunction
 */

/**
 * @class
 * @property {Function} outputFunction
 * @property {Function} errorFunction
 * @extends {StatefulComponent}
 *
 * @description Creates a Genmo Object based on `storyData`, a JSON object created using the [Twison](https://github.com/lazerwalker/twison) format in [Twine](https://twinery.org/)
 */
export class Genmo extends StatefulComponent {
  /**
   * @param {StoryData} storyData
   * @param {GenmoOptions} opts
   * @throws {InvalidStoryError}
   */
  constructor(storyData, opts = {}) {
    super(
      {
        storyData,
        currentPassage: null,
        data: {
          inventory: {},
        },
      },
      reducers
    );

    if (!storyData || !storyData.passages || !storyData.startnode) {
      throw new InvalidStoryError(`storyData given to Genmo is invalid.`);
    }

    this.outputFunction =
      opts.outputFunction || (console && console.log) || this.noop;
    this.errorFunction =
      opts.errorFunction || (console && console.warn) || this.noop;

    this.followLink(storyData.startnode);
  }
  /**
   * Calls the provided `outputFunction` during construction with the current passage.
   * If `outputFunction` returned something, this returns that as well.
   *
   * @return {any}
   */
  outputCurrentPassage() {
    return this.outputFunction(this.getCurrentPassage());
  }
  /**
   * Returns current passage. This function also appends `passageText` (with data and helpers replaced), and filters links
   * @return {Passage}
   */
  getCurrentPassage() {
    return this.getPassage(this.state.currentPassage);
  }
  /**
   * Returns the passage indicated by passageOrPid, with `passageText` set and `passage.link` properly filtered.
   * Returns null if passage is not found.
   *
   * @param {Passage|Pid} passageOrPid
   * @returns {Passage}
   */
  getPassage(passageOrPid) {
    const pid = passageOrPid.pid ? passageOrPid.pid : passageOrPid;

    if (!pid) return null;

    const passage = {
      ...(this.state.storyData.passages.find(
        (passage) => passage.pid === pid
      ) || {}),
    };

    if (!Object.keys(passage).length) return null;

    passage.passageText = this.getPassageText(passage);

    passage.links = passage.links
      .map((link) => linkFilter(link, this.state.data))
      .filter((l) => l);

    return passage;
  }
  /**
   * Returns a passage with the `name` property set to `name`, or null if it doesn't exist.
   *
   * @param {String} name
   * @returns {Passage}
   */
  getPassageByName(name) {
    const passage = {
      ...this.state.storyData.passages.find((passage) => passage.name === name),
    };
    return this.getPassage(passage);
  }
  /**
   * Returns whether this passage is valid or not. A valid passage is an object that has a key `pid` that matches an object in `state.storyData.passages`
   *
   * @param {Passage|null} passage
   * @returns {Boolean}
   */
  isValidPassage(passage) {
    if (!passage) return false;
    return Boolean(
      this.state.storyData.passages.find((p) => p.pid === passage.pid)
    );
  }
  /**
   * Splits up the passage based on `DIVIDER`
   * If `passage` is not specified, `currentPassage` is used instead.
   * @param {Passage|null} passage
   * @throws {PassageNotFoundError}
   * @ignore
   */
  splitPassage(passage) {
    const targetPassage = this.isValidPassage(passage)
      ? passage
      : this.getCurrentPassage();
    if (!targetPassage)
      this.onError(new PassageNotFoundError({ pid: (passage || {}).pid }));
    return targetPassage.text.split(DIVIDER);
  }
  /**
   * Returns just the text of the passage, with variables replaced and helpers processed.
   * If `passage` is not specified, `currentPassage` is used instead.
   *
   * @param {Passage|null} passage
   * @return {String}
   */
  getPassageText(passage) {
    const parts = this.splitPassage(passage);
    if (!parts) return null;
    const text = Handlebars.create().compile(parts[0])(this.state.data, {
      helpers: getPassageHelpers(this),
    });

    return text;
  }
  /**
   * Returns the data object associated with this passage, if it exists.
   * If `passage` is not specified, `currentPassage` is used instead.
   *
   * @param {Passage|null} passage
   * @return {Object|null}
   */
  getRawPassageData(passage) {
    const parts = this.splitPassage(passage);
    if (!parts) return null;

    const json = parts.length === 3 ? parts[2] : null;
    let parsed = null;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      // That wasn't JSON we just parsed, oh well.
    }

    // Also get data on the passage set by Mustache
    const handleBarsData = {
      ...(parsed || {}),
    };
    Handlebars.create().compile(parts[0])(this.state.data, {
      helpers: getDataHelpers(handleBarsData, this.state.currentPassage),
    });

    if (Object.keys(handleBarsData).length) {
      return handleBarsData;
    }
    return parsed;
  }
  /**
   * Gets the `passage_data` object for the current passage, or an empty Object if it isn't set.
   * If `passage` is not specified, `currentPassage` is used instead.
   *
   * @param {Passage|null} passage
   * @returns {Object}
   */
  getPassageData(passage) {
    return (
      (this.getRawPassageData(passage) || {})[SPECIAL_DATA_KEYS.PASSAGE_DATA] ||
      {}
    );
  }
  /**
   * Merges `data` with Genmo's `state.data`
   * @param {Object} data
   */
  setData(data) {
    if (!(typeof data === "object")) {
      return false;
    }

    this.doAction({
      ...actions.SET_DATA,
      data,
    });
  }
  /**
   * Returns Genmo's custom data
   * @return {Object}
   */
  getData() {
    return { ...this.state.data };
  }
  /**
   * Follows the given link or pid to the next passage.
   *
   * The link must exist on the current passage (`getCurrentPassage()`). Otherwise an error will be sent to `errorFunction`.
   * An error will also be sent if the linked to passage doesn't exist.
   *
   * @param {Passage|Pid} link
   * @param {Function} [callback]
   * @param  {...any} [callbackArgs]
   * @throws {InvalidLinkError}
   * @throws {LinkNotFoundError}
   * @throws {PassageNotFoundError}
   */
  followLink(link, callback, ...callbackArgs) {
    if (!link) {
      return this.errorFunction(
        new InvalidLinkError({
          link,
        })
      );
    }

    let pid = link;
    if (link.hasOwnProperty("pid")) {
      pid = link.pid;
    }

    const storyIsStarting =
      pid === this.state.storyData.startnode &&
      this.state.currentPassage === null;

    const activeLink =
      storyIsStarting ||
      this.state.currentPassage.links.find((l) => l.pid === pid);

    if (!activeLink) {
      return this.errorFunction(
        new LinkNotFoundError({
          link,
        })
      );
    }

    const nextPassage = this.state.storyData.passages.find(
      (p) => p.pid === pid
    );
    if (!nextPassage) {
      return this.errorFunction(
        new PassageNotFoundError({
          pid,
        })
      );
    }

    this.doAction(
      {
        ...actions.FOLLOW_LINK,
        link: activeLink,
        nextPassage,
      },
      callback,
      ...callbackArgs
    );
  }
  /**
   * When a passage requires a prompt, this function will add the response to the story's `state.data`
   *
   * @param {String} response
   * @param {Function} [callback]
   * @param  {...any} [callbackArgs]
   */
  respondToPrompt(response, callback, ...callbackArgs) {
    const responseEntries = Object.entries(response);
    const [key, value] = (() => {
      if (responseEntries.length) {
        return responseEntries[0];
      }
      return [null, null];
    })();
    this.doAction(
      {
        ...actions.PROMPT_ANSWER,
        key,
        value,
        pid: this.state.currentPassage.pid,
      },
      callback,
      ...callbackArgs
    );
  }
  /**
   * Returns the inventory
   * @return {Object}
   */
  getInventory() {
    return this.state.data[SPECIAL_DATA_KEYS.INVENTORY];
  }
  /**
   *
   * @param {String} item
   * @return {Number|null} the quantity of `item`, null if the item isn't in the inventory at all.
   */
  getItem(item) {
    return (this.getInventory() || {})[item] || null;
  }
  /**
   * Returns whether the item a) exists in the inventory and b) the player has more than 0 of that item
   * @param {String} item
   * @return {Boolean}
   */
  hasItem(item) {
    return Boolean(this.getItem(item));
  }
  /**
   * Directly adds quantities of items to the inventory. The items object uses the item name as key, and the quantity change as value.
   *
   * @example
   * const newItems = {
   *  toy: 1,
   *  coin: -2,
   * }
   * updateInventory(newItems);
   * // This will add one `toy` and remove 2 `coins`
   * @param {Object} items
   */
  updateInventory(items) {
    this.doAction({
      ...actions.UPDATE_INVENTORY,
      items,
    });
  }
  /**
   *
   * @param {String} item
   */
  addInventory(item) {
    this.updateInventory({
      [item]: 1,
    });
  }
  /**
   *
   * @param {String} item
   */
  removeInventory(item) {
    this.updateInventory({
      [item]: -1,
    });
  }
  /**
   * Handles the error passed in. Default is to call `errorFunction`
   *
   * @ignore
   * @param {Error} err
   */
  onError(err) {
    this.errorFunction(err);
  }
  /**
   * A noop function as a placeholder for outputFunction / errorFunction
   * @ignore
   */
  noop() {}
}

export * as ERRORS from "./utils/errors";
