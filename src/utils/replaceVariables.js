export const variableRegEx = new RegExp(/#{(\S+)}/g);
const excludedValues = [">>"];
const replaceVariables = (content = "", customData = {}) => {
  return content.replace(variableRegEx, (match, varName) => {
    return customData[varName] &&
      excludedValues.indexOf(customData[varName]) < 0
      ? customData[varName]
      : match;
  });
};

export default replaceVariables;
