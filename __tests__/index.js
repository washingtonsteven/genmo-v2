const { Genmo } = require("../lib");
const { ERRORS } = require("../src/utils");
const { GenmoTest } = require("./stories");

const outputPid = ({ pid }) => pid;

const outputErrorType = ({ type }) => type;

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
});

describe("basic navigation", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: outputErrorType
    });
  });

  test("output starting node", () => {
    expect(genmo.outputCurrentPassage()).toBe(
      GenmoTest.passages.find(p => p.pid === GenmoTest.startnode).pid
    );
  });

  test("follow a link", () => {
    const link = genmo.state.currentPassage.links[0];
    genmo.followLink(link);
    expect(genmo.outputCurrentPassage()).toBe(link.pid);
  });

  test("invalid link warning", () => {
    expect(genmo.followLink()).toEqual(ERRORS.InvalidLinkError.type);
  });

  test("link not found warning", () => {
    expect(genmo.followLink(Math.floor(Math.random() * 1000) + 5000)).toEqual(
      ERRORS.LinkNotFoundError.type
    );
  });
});

describe("data update", () => {
  let genmo;
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: outputPid,
      errorFunction: outputErrorType
    });
  });

  test("data properly set", () => {
    genmo.followLink(GenmoTest.passages[1].pid);
    expect(genmo.state.data).toEqual({
      s: -2,
      d: 5,
      c: "a string guvna"
    });
  });
});

describe("conditional links", () => {
  let genmo;
  const badlink = [
    {
      name: "Staring at the truth til I'm blind",
      link: "Staring at the truth til I'm blind",
      pid: "7"
    }
  ];
  beforeEach(() => {
    genmo = new Genmo(GenmoTest, {
      outputFunction: passage => passage.links,
      errorFunction: outputErrorType
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
      outputFunction: passage => passage.passageText,
      errorFunction: outputErrorType
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
      outputFunction: passage => passage.needsPrompt,
      errorFunction: outputErrorType
    });
  });

  test("Receive proper prompt", () => {
    genmo.followLink("4");
    const prompts = genmo.outputCurrentPassage();
    expect(prompts.filter(p => !p.complete).length).toBeGreaterThan(0);
  });

  test("Respond Properly", () => {
    genmo.followLink("4");
    const prompts = genmo.outputCurrentPassage();
    const promptValue = "Steve";
    genmo.respondToPrompt({
      [prompts[0].key]: promptValue
    });
    expect(genmo.state.data[prompts[0].key]).toBe(promptValue);
  });

  test("Navigation doesn't reset prompt needs", () => {
    genmo.followLink("4");
    genmo.respondToPrompt({
      name: promptValue
    });
    genmo.followLink("1");
    genmo.followLink("4");
    expect(genmo.outputCurrentPassage().filter(p => !p.complete).length).toBe(
      1
    );
  });
});
