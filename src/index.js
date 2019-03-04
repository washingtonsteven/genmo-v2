import StatefulComponent from "./state/stateful-component";
import { ACTIONS as actions, reducers, DIVIDER } from "./state/genmo-reducers";

export const ERRORS = {
  InvalidLinkError: {
    type: "InvalidLinkError",
    code: 1,
    message: "Link supplied to followLink was invalid."
  },
  LinkNotFoundError: {
    type: "LinkNotFoundError",
    code: 2,
    message:
      "Tried to activate a link, but it wasn't present on the currentPassage"
  },
  PassageNotFoundError: {
    type: "PassageNotFoundError",
    code: 3,
    message: "Could not find passage"
  }
};

const CONDITION_REGEX = /(.+)\s(.+)\s(.+)/;

const numberOperators = ["lt", "gt", "lte", "gte"];

export class Genmo extends StatefulComponent {
  constructor(storyData, opts = {}) {
    super(
      {
        storyData,
        currentPassage: (() => {
          if (!storyData || !storyData.passages || !storyData.passages.length)
            return null;

          return storyData.passages.find(p => p.pid === storyData.startnode);
        })(),
        data: {}
      },
      reducers
    );

    if (!storyData || !storyData.passages || !this.state.currentPassage) {
      throw new Error(`storyData given to Genmo is invalid.`);
    }

    this.outputFunction =
      opts.outputFunction || (console && console.log) || this.noop;
    this.errorFunction =
      opts.errorFunction || (console && console.warn) || this.noop;
  }
  outputCurrentPassage() {
    return this.outputFunction(this.getCurrentPassage());
  }
  getCurrentPassage() {
    const passage = {
      ...this.state.currentPassage
    };

    passage.passageText = this.getPassageText(passage);

    passage.links = passage.links
      .map(link => this.linkFilter(link))
      .filter(l => l);

    return passage;
  }
  getPassageText(passage) {
    if (!passage || !passage.text) return null;
    const parts = passage.text.split(DIVIDER);
    return parts[0];
  }
  followLink(link, callback) {
    if (!link) {
      return this.errorFunction({
        ...ERRORS.InvalidLinkError,
        message: `Link supplied to followLink was ${typeof link}, which is invalid`
      });
    }

    let pid = link;
    if (link.hasOwnProperty("pid")) {
      pid = link.pid;
    }

    const activeLink = this.state.currentPassage.links.find(l => l.pid === pid);
    if (!activeLink) {
      return this.errorFunction({
        ...ERRORS.LinkNotFoundError,
        message: `Tried to activate a link to ${pid}, but that isn't a link on the current passage`
      });
    }

    const nextPassage = this.state.storyData.passages.find(
      p => p.pid === activeLink.pid
    );
    if (!nextPassage) {
      return this.errorFunction({
        ...ERRORS.PassageNotFoundError,
        message: `Link said to go to passage with id:${
          activeLink.pid
        }, but that isn't a passage.`
      });
    }

    this.doAction({
      ...actions.FOLLOW_LINK,
      link: activeLink,
      nextPassage
    });
  }
  linkFilter(link) {
    const filteredLink = { ...link };
    const data = { ...this.state.data };
    const linkNameParts = filteredLink.name.split("||");

    if (linkNameParts.length < 2) return filteredLink;

    const linkName = linkNameParts[0];
    const [
      condition,
      variable,
      operator,
      ref,
      ...otherMatch
    ] = linkNameParts[1].match(CONDITION_REGEX);

    filteredLink.name = linkName;

    if (!data[variable]) {
      return null;
    }

    if (numberOperators.indexOf(operator) >= 0) {
      if (isNaN(Number(data[variable])) || isNaN(Number(ref))) {
        return null;
      }
    }

    switch (operator) {
      case "gte": {
        if (Number(data[variable]) >= Number(ref)) {
          return filteredLink;
        }
      }
      case "lte": {
        if (Number(data[variable]) <= Number(ref)) {
          return filteredLink;
        }
      }
      case "lt": {
        if (Number(data[variable]) < Number(ref)) {
          return filteredLink;
        }
      }
      case "gt": {
        if (Number(data[variable]) < Number(ref)) {
          return filteredLink;
        }
      }
      case "eq": {
        if (data[variable] == ref) {
          return filteredLink;
        }
      }
      case "seq": {
        // strict equals
        if (data[variable] === ref) {
          return filteredLink;
        }
      }
      default: {
        return null;
      }
    }
  }
  noop() {}
}
