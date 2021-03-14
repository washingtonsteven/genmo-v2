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
  test("getPassageByName", () => {
    const genmo = new Genmo(GenmoTest);
    const passage = GenmoTest.passages.find((p) => p.pid === "4");
    const foundPassage = genmo.getPassageByName(passage.name);

    expect(foundPassage).toStrictEqual(expect.objectContaining(passage));
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
    expect(genmo.getRawPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        s: "--2",
        d: "++5",
        c: "a string guvna",
      })
    );
    genmo.followLink(genmo.getCurrentPassage().links[1]);
    expect(genmo.getRawPassageData(genmo.getCurrentPassage())).toStrictEqual(
      expect.objectContaining({
        inventory_add: ["book", "toothpaste"],
      })
    );
    genmo.followLink("1");
    genmo.followLink("5");
    expect(genmo.getRawPassageData(genmo.getCurrentPassage())).toBeNull();
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

  test("Works with Mustache template", () => {
    genmo.setData({ age: 16 });
    const passage = {
      text: "My age is {{age}}",
      pid: "1",
    };
    expect(genmo.getPassageText(passage)).toEqual("My age is 16");
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
    expect(genmo.getRawPassageData(genmo.getCurrentPassage())).toStrictEqual(
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
    expect(genmo.getRawPassageData(genmo.getCurrentPassage())).toStrictEqual(
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

  test("add/removeInventory functions", () => {
    genmo.addInventory("phone");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        phone: 1,
      })
    );
    genmo.removeInventory("phone");
    expect(genmo.getInventory()).toStrictEqual(
      expect.objectContaining({
        phone: 0,
      })
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

  test("Works with Mustache", () => {
    genmo.updateInventory({
      coin: 1,
      toy: 0,
      book: 1,
    });
    genmo.setData({
      age: 16,
    });
    const passage = {
      text: `
      {{#inventory_has items="coin"}}You have a coin and you are {{age}}{{/inventory_has}}
      {{#inventory_has items="toy"}}You have a toy{{/inventory_has}}
      {{#inventory_not_has items="toothbrush"}}You don't have a toothbrush{{/inventory_not_has}}
      {{#inventory_has items="coin book"}}You have a coin and a book{{/inventory_has}}
      `,
      pid: "1",
    };

    expect(genmo.getPassageText(passage)).toMatch(
      "You have a coin and you are 16"
    );
    expect(genmo.getPassageText(passage)).not.toMatch("You have a toy");
    expect(genmo.getPassageText(passage)).toMatch(
      "You don't have a toothbrush"
    );
    expect(genmo.getPassageText(passage)).toMatch("You have a coin and a book");
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

  test("changed", () => {
    genmo.setData({
      age: 16,
      birthYear: 2004,
      fruit: "orange",
      complex: {
        address: "16 Main St",
        city: "Springfield",
      },
    });
    genmo.setData({
      age: 16,
      birthYear: 2005,
      fruit: "apple",
      complex: {
        address: "16 Main St",
        city: "Springfield",
      },
    });
    const passage = {
      text: `
        {{#changed keys="birthYear"}}Updated birth year{{/changed}}
        {{#changed keys="age"}}Updated age!{{/changed}}
        {{#changed keys="birthYear fruit"}}Changed birth year and fruit{{/changed}}
        {{#changed keys="age fruit"}}Changed fruit and age{{/changed}}
        {{#changed keys="complex"}}Changed complex{{/changed}}
      `,
      pid: "1",
    };
    const passageText = genmo.getPassageText(passage);
    expect(passageText).toMatch("Updated birth year");
    expect(passageText).not.toMatch("Updated age!");
    expect(passageText).toMatch("Changed birth year and fruit");
    expect(passageText).not.toMatch("Changed fruit and age");
    expect(passageText).not.toMatch("Changed complex");
  });
});

describe("transient/passage data", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: returnError,
    });
  });

  test("Passage data exists", () => {
    expect(Object.keys(genmo.getPassageData())).toStrictEqual([]);

    // goto passage
    genmo.followLink("10");
    expect(genmo.getPassageData()).toStrictEqual({
      room_has_moose: true,
    });
    expect(genmo.state.data).toStrictEqual(
      expect.objectContaining({
        stickiness: 10,
        passage_data: {
          room_has_moose: true,
        },
      })
    );

    // back away from passage
    genmo.followLink("1");
    expect(Object.keys(genmo.getPassageData())).toStrictEqual([]);
    expect(genmo.state.data).toStrictEqual(
      expect.objectContaining({
        stickiness: 10,
        passage_data: {},
      })
    );
  });
});
