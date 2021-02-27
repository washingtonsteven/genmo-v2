export class GenmoError extends Error {
  constructor(message, errorInfo, code = -1) {
    super(message);
    this.errorInfo = errorInfo;
    this.code = code;
  }
  toObject() {
    return Object.getOwnPropertyNames(this).reduce((obj, key) => {
      obj[key] = this[key];
      return obj;
    }, {});
  }
}

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
export class PassageNotFoundError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr = Object.hasOwnProperty.call(errorInfo, "pid")
      ? `Tried to find ${errorInfo.pid}`
      : `no passage specified`;
    super(`Could not find passage: ${errorInfoStr}`, errorInfo, 3);
  }
}

export class NoStartingNodeError extends GenmoError {
  constructor(errorInfo) {
    super("There is no attribute on your story JSON `startnode`", errorInfo, 4);
  }
}

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

export class InvalidPassageDataError extends GenmoError {
  constructor(errorInfo) {
    const errorInfoStr =
      errorInfo.currentPassage && typeof errorInfo.currentPassage === "object"
        ? `Couldn't properly parse data for '${errorInfo.currentPassage.name}' (${errorInfo.currentPassage.pid})`
        : "no current passage specified";

    super(errorInfoStr, errorInfo, 6);
  }
}
