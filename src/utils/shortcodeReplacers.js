class ShortcodeReplacers {
  constructor(genmo) {
    this.genmo = genmo;
  }
  getReplacers() {
    return [this.inventoryHas.bind(this)];
  }
  inventoryHas({ openTag, tagArgs, tagContent, closeTag }) {
    const items = tagArgs.split(/\s+/);
    if (openTag === "inventory_has") {
      let hasAllItemsInList = true;
      items.forEach((item) => {
        if (!this.genmo.hasItem(item)) {
          hasAllItemsInList = false;
        }
      });
      if (hasAllItemsInList) return tagContent;
    } else if (openTag === "!inventory_has") {
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
}

export { ShortcodeReplacers };
