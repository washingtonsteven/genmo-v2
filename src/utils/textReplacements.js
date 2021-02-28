export const variableRegEx = new RegExp(/#{(\S+)}/g);
export const shortCodeRegEx = new RegExp(
  /#\{(!?\S*)\s+(.*?)\}([\s\S]*?)#\{\/(\1)\}/gm
);
const excludedValues = [">>"];

export const replaceShortCodes = (content = "", replacers = []) => {
  let shortCodesReplaced = content;

  // No nesting your shortcodes!
  shortCodesReplaced = content.replace(
    shortCodeRegEx,
    (match, openTag, tagArgs, tagContent, closeTag, lineFeed, offset) => {
      let value = content;
      replacers.forEach((replacer) => {
        value =
          replacer({
            openTag,
            tagArgs,
            tagContent,
            closeTag,
            lineFeed,
          }) || "";
      });

      return value;
    }
  );

  return shortCodesReplaced;
};

export const replaceVariables = (content = "", customData = {}) => {
  const variablesReplaced = content.replace(variableRegEx, (match, varName) => {
    return customData[varName] &&
      excludedValues.indexOf(customData[varName]) < 0
      ? customData[varName]
      : match;
  });

  return variablesReplaced;
};
