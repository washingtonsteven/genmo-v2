export const variableRegEx = new RegExp(/#{(\S+)}/g);
const replaceVariables = (content = "", customData = {}) => {
  return content.replace(variableRegEx, (match, varName) => {
    return customData[varName] || match;
  });
};

export default replaceVariables;
