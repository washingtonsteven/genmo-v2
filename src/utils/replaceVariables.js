export const variableRegEx = new RegExp(/#{(\S+)}/g);
export const shortCodeRegEx = new RegExp(
  /#\{(!?\S*)\s+(.*?)\}(.*)#\{\/(\S*)\}/g
);
const excludedValues = [">>"];

const hasShortCodes = (content = "") => {
  return content.match(shortCodeRegEx);
};

export const replaceShortCodes = (content = "", replacers = []) => {
  let shortCodesReplaced = content;

  while (hasShortCodes(shortCodesReplaced)) {
    shortCodesReplaced = content.replace(
      shortCodeRegEx,
      (match, openTag, tagArgs, tagContent, closeTag, offset) => {
        let value = content;
        replacers.forEach((replacer) => {
          value =
            replacer({
              openTag,
              tagArgs,
              tagContent,
              closeTag,
            }) || "";
        });

        return value;
      }
    );
  }

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
