import StatefulComponent from "./state/stateful-component";
import { ACTIONS as actions, reducers } from "./state/genmo-reducers";

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

export class Genmo extends StatefulComponent {
  constructor(storyData, opts = {}) {
    super(
      {
        storyData,
        currentPassage: (() => {
          if (!storyData || !storyData.passages || !storyData.passages.length)
            return null;

          return storyData.passages.find(p => p.pid === storyData.startnode);
        })()
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
    return this.outputFunction({
      passageText: this.getPassageText(this.state.currentPassage),
      ...this.state.currentPassage
    });
  }
  getPassageText(passage) {
    if (!passage || !passage.text) return null;
    const parts = passage.text.split("\n---\n");
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
  noop() {}
}
