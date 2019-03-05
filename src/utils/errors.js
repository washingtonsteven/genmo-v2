const ERRORS = {
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

export default ERRORS;
