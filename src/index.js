import StatefulComponent from "./state/statefulComponent";
import { ACTIONS as actions, reducers, DIVIDER } from "./state/genmoReducers";
import { linkFilter, ERRORS, replaceVariables } from "./utils";

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
      .map(link => linkFilter(link, this.state.data))
      .filter(l => l);

    return passage;
  }
  getPassageText(passage) {
    if (!passage || !passage.text) return null;
    const parts = passage.text.split(DIVIDER);
    const text = parts[0];

    return replaceVariables(text, this.state.data);
  }
  followLink(link, callback, ...callbackArgs) {
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

    this.doAction(
      {
        ...actions.FOLLOW_LINK,
        link: activeLink,
        nextPassage
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
        pid: this.state.currentPassage.pid
      },
      callback,
      ...callbackArgs
    );
  }
  noop() {}
}
