const { Genmo, ERRORS } = require("../lib");
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
