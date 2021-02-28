import StatefulComponent from "./state/statefulComponent";
import {
  ACTIONS as actions,
  reducers,
  DIVIDER,
  SPECIAL_DATA_KEYS,
} from "./state/genmoReducers";
import { linkFilter } from "./utils/conditionalFilters";
import { replaceVariables, replaceShortCodes } from "./utils/textReplacements";
import {
  InvalidLinkError,
  InvalidStoryError,
  LinkNotFoundError,
  PassageNotFoundError,
} from "./utils/errors";
import { ShortcodeReplacers } from "./utils/shortcodeReplacers";

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
 * @property {ShortcodeReplacers} shortcodeReplacers
 */
export class Genmo extends StatefulComponent {
  /**
   * Creates a Genmo Object based on `storyData`, a JSON object created
   * from using the [Twison](https://github.com/lazerwalker/twison) format in [Twine](https://twinery.org/)
   *
   * @param {StoryData} storyData
   * @param {GenmoOptions} opts
   * @throws {InvalidStoryError}
   */
  constructor(storyData, opts = {}) {
    super(
      {
        storyData,
        currentPassage: null,
        data: {},
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

    this.shortCodeReplacers = new ShortcodeReplacers(this);
  }
  /**
   * Calls the provided `outputFunction` during construction with the current passage
   */
  outputCurrentPassage() {
    return this.outputFunction(this.getCurrentPassage());
  }
  /**
   * Returns current passage. This function also appends `passageText` (with data and shortcodes replaced), and filters links
   * @return {Passage}
   */
  getCurrentPassage() {
    const passage = {
      ...this.state.currentPassage,
    };

    passage.passageText = this.getPassageText(passage);

    passage.links = passage.links
      .map((link) => linkFilter(link, this.state.data))
      .filter((l) => l);

    return passage;
  }
  splitPassage(passage) {
    if (!passage || !passage.text) return null;
    return passage.text.split(DIVIDER);
  }
  /**
   * Returns just the text of the passage, with variables replaced and shortcodes processed.
   *
   * @param {Passage} passage
   */
  getPassageText(passage) {
    const parts = this.splitPassage(passage);
    if (!parts) return null;

    const text = parts[0];
    const variablesReplaced = replaceVariables(text, this.state.data);
    const shortCodesReplaced = replaceShortCodes(
      variablesReplaced,
      this.shortCodeReplacers.getReplacers()
    );

    return shortCodesReplaced;
  }
  /**
   * Returns the data object associated with this passage, if it exists.
   * @param {Passage|null} passage
   */
  getPassageData(passage) {
    const parts = this.splitPassage(passage);
    if (!parts) return null;

    const json = parts[parts.length - 1];
    let parsed = null;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      // That wasn't JSON we just parsed, oh well.
    }

    return parsed;
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
   */
  getData() {
    return { ...this.state.data };
  }
  /**
   * Follows the given link or pid to the next passage.
   *
   * The link must exist on the current passage (`getCurrentPassage()`). Otherwise an error will be thrown.
   * An error will also be thrown in the linked to passage doesn't exist.
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
  getInventory() {
    return this.state.data[SPECIAL_DATA_KEYS.INVENTORY];
  }
  /**
   *
   * @param {String} item
   */
  getItem(item) {
    return (this.getInventory() || {})[item];
  }
  /**
   * Returns whether the item a) exists in the inventory and b) the player has more than 0 of that item
   * @param {String} item
   */
  hasItem(item) {
    return Boolean(this.getItem(item));
  }
  /**
   * Directly adds quantities of items to the inventory. The items object uses the item name as key, and the quantity change as value:
   *
   * ```js
   * const newItems = {
   *  toy: 1,
   *  coin: -2,
   * }
   * updateInventory(newItems);
   * ```
   *
   * This will add one `toy` and remove 2 `coins`
   * @param {Object} items
   */
  updateInventory(items) {
    this.doAction({
      ...actions.UPDATE_INVENTORY,
      items,
    });
  }
  onError(err) {
    this.errorFunction(err);
  }
  noop() {}
}

export * as ERRORS from "./utils/errors";
