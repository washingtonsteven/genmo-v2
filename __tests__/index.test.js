const { Genmo, ERRORS } = require("../src");
const {
  InvalidLinkError,
  LinkNotFoundError,
  InvalidDataKeyError,
} = require("../src/utils/errors");
const { GenmoTest } = require("./stories");

const outputPid = ({ pid }) => pid;

const returnError = (err) => {
  console.error(err);
  return err;
};

describe("basic setup", () => {
  test("start up without error", () => {
    expect(() => {
      new Genmo(GenmoTest);
    }).not.toThrow();
  });
  test("start w/o storyData will error", () => {
    expect(() => {
      new Genmo();
    }).toThrow();
  });
  test("Error export working", () => {
    expect(ERRORS).toStrictEqual(
      expect.objectContaining({
        GenmoError: expect.any(Function),
        InvalidLinkError: expect.any(Function),
        LinkNotFoundError: expect.any(Function),
        PassageNotFoundError: expect.any(Function),
        NoStartingNodeError: expect.any(Function),
        InvalidDataKeyError: expect.any(Function),
        InvalidPassageDataError: expect.any(Function),
      })
    );
  });
});

describe("basic navigation", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: returnError,
    });
  });

  test("output starting node", () => {
    expect(genmo.outputCurrentPassage()).toBe(
      GenmoTest.passages.find((p) => p.pid === GenmoTest.startnode).pid
    );
  });

  test("follow a link", () => {
    const link = genmo.getCurrentPassage().links[0];
    genmo.followLink(link);
    expect(genmo.outputCurrentPassage()).toBe(link.pid);
  });

  test("invalid link warning", () => {
    genmo.errorFunction = jest.fn();
    genmo.followLink();
    expect(genmo.errorFunction).toHaveBeenCalledWith(
      expect.any(InvalidLinkError)
    );
  });

  test("link not found warning", () => {
    genmo.errorFunction = jest.fn();
    genmo.followLink(Math.floor(Math.random() * 1000) + 5000);
    expect(genmo.errorFunction).toHaveBeenCalledWith(
      expect.any(LinkNotFoundError)
    );
  });
});

describe("data update", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: returnError,
    });
  });

  test("data properly set", () => {
    genmo.followLink(GenmoTest.passages[1].pid);
    expect(genmo.state.data).toStrictEqual(
      expect.objectContaining({
        s: -2,
        d: 5,
        c: "a string guvna",
      })
    );
    genmo.followLink(genmo.getCurrentPassage().links[1]);
    // data should be unchanged
    expect(genmo.state.data).toStrictEqual(
      expect.objectContaining({
        s: -2,
        d: 5,
        c: "a string guvna",
      })
    );
  });

  test("protected key is ignored", () => {
    genmo.errorFunction = jest.fn();
    genmo.followLink("8");
    expect(genmo.getInventory()).not.toEqual(
      expect.stringContaining("computer, keyboard, chair")
    );
    expect(genmo.errorFunction).toHaveBeenCalledWith(
      expect.any(InvalidDataKeyError)
    );
  });

  test("able to fetch data for current passage, or null", () => {
    genmo.followLink(GenmoTest.passages[1].pid);
    expect(genmo.getPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        s: "--2",
        d: "++5",
        c: "a string guvna",
      })
    );
    genmo.followLink(genmo.getCurrentPassage().links[1]);
    expect(genmo.getPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        inventory_add: ["book", "toothpaste"],
      })
    );
    genmo.followLink("1");
    genmo.followLink("5");
    expect(genmo.getPassageData(genmo.getCurrentPassage())).toBeNull();
  });

  test("able to set data manually", () => {
    const myData = {
      horse: "of course",
      meaning: 42,
      donuts: true,
    };
    genmo.setData(myData);
    expect(genmo.getData()).toStrictEqual(expect.objectContaining(myData));
  });
});

describe("conditional links", () => {
  let genmo;
  const badlink = [
    {
      name: "Staring at the truth til I'm blind",
      link: "Staring at the truth til I'm blind",
      pid: "7",
    },
  ];
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: (passage) => passage.links,
      errorFunction: returnError,
    });
  });

  test("invalid link is not there", () => {
    const links = genmo.outputCurrentPassage();
    expect(links).toEqual(expect.not.arrayContaining(badlink));
  });

  test("valid link after proper navigation", () => {
    genmo.followLink("2");
    genmo.followLink("1");
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.arrayContaining(badlink)
    );
  });
});

describe("variable interpolation", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: (passage) => passage.passageText,
      errorFunction: returnError,
    });
  });

  const expectedOutputWithData = "s is -2\nd is 5\nc is a string guvna";
  const expectedOutputWithoutData = "s is #{s}\nd is #{d}\nc is #{c}";

  test("data is output when set", () => {
    genmo.followLink("2");
    genmo.followLink("3");
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.stringContaining(expectedOutputWithData)
    );
  });

  test("Match is left alone when not set", () => {
    genmo.followLink("3");
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.stringContaining(expectedOutputWithoutData)
    );
  });
});

describe("prompt", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: (passage) => passage.needsPrompt,
      errorFunction: returnError,
    });
  });

  test("Receive proper prompt", () => {
    genmo.followLink("4");
    const prompts = genmo.outputCurrentPassage();
    expect(prompts.filter((p) => !p.complete).length).toBeGreaterThan(0);
  });

  test("Respond Properly", () => {
    genmo.followLink("4");
    const prompts = genmo.outputCurrentPassage();
    const promptValue = "Steve";
    genmo.respondToPrompt({
      [prompts[0].key]: promptValue,
    });
    expect(genmo.state.data[prompts[0].key]).toBe(promptValue);
  });

  test("Navigation doesn't reset prompt needs", () => {
    const promptValue = "Steve";
    genmo.followLink("4");
    genmo.respondToPrompt({
      name: promptValue,
    });
    genmo.followLink("1");
    genmo.followLink("4");
    expect(genmo.outputCurrentPassage().filter((p) => !p.complete).length).toBe(
      1
    );
  });
});

describe("inventory", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: returnError,
    });
  });

  test("Add to inventory", () => {
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        coin: 1,
      })
    );
  });

  test("Add to inventory multiple times", () => {
    genmo.followLink("5");
    genmo.followLink("1");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        coin: 2,
      })
    );
  });

  test("Remove from inventory", () => {
    genmo.followLink("2");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        coin: 0,
      })
    );
  });

  test("Remove from inventory doesn't go negative", () => {
    genmo.followLink("6");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        headphones: 0,
      })
    );
  });

  test("Add via array", () => {
    genmo.followLink("3");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        book: 1,
        toothpaste: 1,
      })
    );
  });

  test("Remove via array", () => {
    genmo.followLink("3");
    genmo.followLink("1");
    genmo.followLink("7");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        book: 0,
        toothpaste: 0,
      })
    );
  });

  test("Update via function", () => {
    const inventory = {
      phone: 1,
      contract_pages: 46,
    };
    genmo.updateInventory(inventory);
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining(inventory)
    );
  });

  test("Inventory positive conditionals", () => {
    genmo.followLink("2");
    expect(genmo.getPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        inventory_add: expect.objectContaining({
          condition: expect.stringMatching(/^has/),
          name: "bookmark",
        }),
      })
    );

    expect(Object.keys(genmo.getInventory())).not.toContain("bookmark");
    expect(Object.keys(genmo.getInventory())).not.toContain("book");

    genmo.followLink("3");
    expect(Object.keys(genmo.getInventory())).toStrictEqual(
      expect.arrayContaining(["book"])
    );
    genmo.followLink("1");
    genmo.followLink("2");
    expect(Object.keys(genmo.getInventory())).toStrictEqual(
      expect.arrayContaining(["bookmark"])
    );
  });

  test("Inventory negative conditionals", () => {
    genmo.followLink("9");
    expect(genmo.getPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        inventory_add: expect.objectContaining({
          condition: expect.stringMatching(/^!has/),
          name: "membership_card",
        }),
      })
    );
    expect(Object.keys(genmo.getInventory())).not.toContain("membership_card");
    expect(Object.keys(genmo.getInventory())).toStrictEqual(
      expect.arrayContaining(["coin"])
    );
    genmo.followLink("2");
    expect(genmo.getInventory()["coin"]).toBeFalsy();
    genmo.followLink("9");
    expect(Object.keys(genmo.getInventory())).toStrictEqual(
      expect.arrayContaining(["membership_card"])
    );
  });
});

describe("shortcodes", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: (passage) => passage.passageText,
      errorFunction: returnError,
    });
  });

  test("inventory_has", () => {
    const coinOnly = "You have a coin";
    const noToothpaste = "You don't have toothpaste";
    const coinAndBook = "You have a coin and a book";
    genmo.followLink("4");
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.stringContaining(coinOnly)
    );
    expect(genmo.outputCurrentPassage()).not.toEqual(
      expect.stringContaining(coinAndBook)
    );
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.stringContaining(noToothpaste)
    );
    genmo.followLink("1");
    genmo.followLink("3"); // get book/toothpaste
    genmo.followLink("4");
    expect(genmo.outputCurrentPassage()).toEqual(
      expect.stringContaining(coinAndBook)
    );
    expect(genmo.outputCurrentPassage()).not.toEqual(
      expect.stringContaining(noToothpaste)
    );
  });
});
