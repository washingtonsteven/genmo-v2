import {
  replaceVariables,
  replaceShortCodes,
  shortCodeRegEx,
} from "../../src/utils/textReplacements";

const shortcodeText = `
Once upon a time there was a dragon
#{player_race dragon}He is your grandfather.#{/player_race}
#{player_race human}He ate your grandfather#{/player_race}

#{!inventory_has coin}
You are too poor for the dragon
#{player_race dragon}He gives you a loan#{/player_race}
#{player_race human}He cooks you for dinner{/player_race}
#{/!inventory_has}
`;

// player race is dragon
// !has coin
// extra newlines deal with spacing around shortcodes
// genmo tests will actually handle this.
const expectedText = `
Once upon a time there was a dragon
He is your grandfather.



You are too poor for the dragon
#{player_race dragon}He gives you a loan#{/player_race}
#{player_race human}He cooks you for dinner{/player_race}

`;
// player race is human
// has coin
const humanExpectedText = `
Once upon a time there was a dragon

He ate your grandfather


`;

const defaultReplacer = (race = "dragon", hasCoin = false) => ({
  openTag,
  tagArgs,
  tagContent,
  closeTag,
}) => {
  if (openTag === "player_race" && tagArgs === race) {
    return tagContent;
  } else if (openTag === "inventory_has" && tagArgs === "coin" && hasCoin) {
    return tagContent;
  }
  if (openTag === "!inventory_has" && tagArgs === "coin" && !hasCoin) {
    return tagContent;
  }
  return "";
};

const createReplacer = (race, hasCoin, fn) =>
  jest.fn().mockImplementation(fn || defaultReplacer(race, hasCoin));

describe("replaceShortcodes", () => {
  test("replaces shortcodes", () => {
    const replacer = createReplacer();
    const replacedContent = replaceShortCodes(shortcodeText, [replacer]);

    expect(replacer).toHaveBeenCalledTimes(3);
    expect(replacedContent).toEqual(expectedText);

    const humanReplacer = createReplacer("human", true);
    const humanReplacedContent = replaceShortCodes(shortcodeText, [
      humanReplacer,
    ]);
    expect(humanReplacer).toHaveBeenCalledTimes(3);
    expect(humanReplacedContent).toEqual(humanExpectedText);
  });
});
