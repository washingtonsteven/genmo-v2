/** @module */
/** @type {RegExp}
 * @description RegEx to match variables in text
 * @ignore
 */
export const variableRegEx = new RegExp(/#{(\S+)}/g);
/** @type {RegExp}
 * @description RegEx to match shortcodes (and their content) in text
 * @ignore
 */
export const shortCodeRegEx = new RegExp(
  /#\{(!?\S*)\s+(.*?)\}([\s\S]*?)#\{\/(\1)\}/gm
);
/**
 * @type {String[]}
 * @description Any special variables/values that will not be replaced in text
 *  - ">>" indicates that a prompt is necessary, and this will never be the final prompt data
 * @ignore
 */
const excludedValues = [">>"];

/**
 *
 * @typedef {Object} ShortcodeInfo
 * @property {String} openTag
 * @property {String} tagArgs
 * @property {String} tagContent
 * @property {String} closeTag
 */

/**
 * @typedef {Function} Replacer
 * @param {ShortcodeInfo} shortcodeInfo
 */

/**
 * Finds all shortcodes in `content`, then sends them to all provided `replacer` functions, which can return whatever they want the value to be. If a replacer returns something false, the value is unchanged.
 *
 * @function
 * @param {String} content
 * @param {Replacer[]} replacers
 */
export const replaceShortCodes = (content = "", replacers = []) => {
  let shortCodesReplaced = content;

  // No nesting your shortcodes!
  shortCodesReplaced = content.replace(
    shortCodeRegEx,
    (match, openTag, tagArgs, tagContent, closeTag) => {
      let value = match;
      replacers.forEach((replacer) => {
        value =
          replacer({
            openTag,
            tagArgs,
            tagContent,
            closeTag,
          }) || ""; // TODO: This works for 1 replacer, but replacers need to return `value` if they don't want to modify it, but also return `""` if they do want to modify it, and delete it. The fix is to pass in `value` into `replacer` as well, and allow the replacer to just return that if it decided to not do anything with it.
      });

      return value;
    }
  );

  return shortCodesReplaced;
};

/**
 * Replaces variables in `content` (marked by `#{varName}`) with data in `customData`
 * If a requested variable is not in `customData`, the variable declaration remains unchanged.
 *
 * @function
 * @param {String} content
 * @param {Object} customData
 */
export const replaceVariables = (content = "", customData = {}) => {
  const variablesReplaced = content.replace(variableRegEx, (match, varName) => {
    return customData[varName] &&
      excludedValues.indexOf(customData[varName]) < 0
      ? customData[varName]
      : match;
  });

  return variablesReplaced;
};
