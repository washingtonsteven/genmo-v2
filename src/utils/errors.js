/**
 * @class
 * Generic Genmo Error
 * @property {String} message
 * @property {Object} errorInfo
 * @property {Number} code
 */
export class GenmoError extends Error {
  constructor(message, errorInfo, code = -1) {
    super(message);
    this.errorInfo = errorInfo;
    this.code = code;
  }
  /**
   * Converts this error into a plan Object, with all its fields intact.
   * @return {Object}
   */
  toObject() {
    return Object.getOwnPropertyNames(this).reduce((obj, key) => {
      obj[key] = this[key];
      return obj;
    }, {});
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class InvalidLinkError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr = errorInfo.link
      ? `Supplied link: ${
          typeof errorInfo.link === "object"
            ? errorInfo.link.pid
            : errorInfo.link
        }`
      : `no link provided`;
    super(
      `Link supplied to followLink was invalid: ${errorInfoStr}`,
      errorInfo,
      1
    );
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class LinkNotFoundError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr = errorInfo.link
      ? `Attempted link: ${
          typeof errorInfo.link === "object"
            ? errorInfo.link.pid
            : errorInfo.link
        }`
      : "no link provided";
    super(
      `Tried to activate a link, but it wasn't present on the currentPassage: ${errorInfoStr}`,
      errorInfo,
      2
    );
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class PassageNotFoundError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr = Object.hasOwnProperty.call(errorInfo, "pid")
      ? `Tried to find ${errorInfo.pid}`
      : `no passage specified`;
    super(`Could not find passage: ${errorInfoStr}`, errorInfo, 3);
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class NoStartingNodeError extends GenmoError {
  constructor(errorInfo) {
    super("There is no attribute on your story JSON `startnode`", errorInfo, 4);
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class InvalidDataKeyError extends GenmoError {
  constructor(errorInfo) {
    const keyStr = errorInfo.key || "no key specified";
    const errorInfoStr =
      errorInfo.currentPassage && typeof errorInfo.currentPassage === "object"
        ? `(pid ${errorInfo.currentPassage.pid} - ${errorInfo.currentPassage.name})`
        : "(no current passage specified)";
    super(
      `Attempted access of a protected data key: \`${keyStr}\` ${errorInfoStr}`,
      errorInfo,
      5
    );
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class InvalidPassageDataError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr =
      errorInfo.currentPassage && typeof errorInfo.currentPassage === "object"
        ? `Couldn't properly parse data for '${errorInfo.currentPassage.name}' (${errorInfo.currentPassage.pid})`
        : "no current passage specified";

    super(errorInfoStr, errorInfo, 6);
  }
}

/**
 * @class
 * @extends {GenmoError}
 */
export class InvalidStoryError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr = "Unable to generate story with storyData provided.";
    super(errorInfoStr, errorInfo, 7);
  }
}
