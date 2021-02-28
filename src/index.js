import StatefulComponent from "./state/statefulComponent";
import {
  ACTIONS as actions,
  reducers,
  DIVIDER,
  SPECIAL_DATA_KEYS,
} from "./state/genmoReducers";
import { linkFilter } from "./utils/conditionalFilters";
import { replaceVariables, replaceShortCodes } from "./utils/replaceVariables";
import {
  InvalidLinkError,
  LinkNotFoundError,
  PassageNotFoundError,
} from "./utils/errors";

export class Genmo extends StatefulComponent {
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
      throw new Error(`storyData given to Genmo is invalid.`);
    }

    this.outputFunction =
      opts.outputFunction || (console && console.log) || this.noop;
    this.errorFunction =
      opts.errorFunction || (console && console.warn) || this.noop;

    this.followLink(storyData.startnode);

    this.shortCodeReplacers = [this.shortcode_inventoryHas];
  }
  outputCurrentPassage() {
    return this.outputFunction(this.getCurrentPassage());
  }
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
  getPassageText(passage) {
    const parts = this.splitPassage(passage);
    if (!parts) return null;

    const text = parts[0];
    const variablesReplaced = replaceVariables(text, this.state.data);
    const shortCodesReplaced = replaceShortCodes(
      variablesReplaced,
      this.shortCodeReplacers
    );

    return shortCodesReplaced;
  }
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
  setData(data) {
    if (!(typeof data === "object")) {
      return false;
    }

    this.doAction({
      ...actions.SET_DATA,
      data,
    });
  }
  getData() {
    return { ...this.state.data };
  }
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
  hasItem(item) {}
  updateInventory(items) {
    this.doAction({
      ...actions.UPDATE_INVENTORY,
      items,
    });
  }
  onError(err) {
    this.errorFunction(err);
  }
  // Separate shortcodes out into their own class?
  shortcode_inventoryHas({ openTag, tagArgs, tagContent, closeTag }) {
    if (openTag === "inventory_has" || openTag === "!inventory_has") {
      const items = tagArgs.split(/\s+/);
      let hasAnyItemInList = false;
      items.forEach((item) => {
        if (this.hasItem(item)) {
          hasAnyItemInList = true;
        }
      });
      if (hasAnyItemInList && openTag === "inventory_has") return tagContent;
      else if (!hasAnyItemInList && openTag === "!inventory_has")
        return tagContent;
      else return "";
    }
  }
  noop() {}
}

export * as ERRORS from "./utils/errors";
