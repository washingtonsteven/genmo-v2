import { SPECIAL_DATA_KEYS } from "../state/genmoReducers";

const CONDITION_REGEX = /(!?\w+|\d+)\s+(\w+|\d+)\s*(\w+|\d+)*/;

const numberOperators = ["lt", "gt", "lte", "gte"];

export const checkCondition = ({ data, variable, operator, ref }) => {
  if (numberOperators.indexOf(operator) >= 0) {
    if (!data[variable]) return false;
    if (isNaN(Number(data[variable])) || isNaN(Number(ref))) return false;
  }

  switch (operator) {
    case "gte":
      if (Number(data[variable]) >= Number(ref)) {
        return true;
      }
      break;
    case "lte":
      if (Number(data[variable]) <= Number(ref)) {
        return true;
      }
      break;
    case "lt":
      if (Number(data[variable]) < Number(ref)) {
        return true;
      }
      break;
    case "gt":
      if (Number(data[variable]) < Number(ref)) {
        return true;
      }
      break;
    case "eq":
      if (data[variable] == ref) {
        return true;
      }
      break;
    case "seq":
      // strict equals
      if (data[variable] === ref) {
        return true;
      }
      break;
    case "has":
      if (
        data[SPECIAL_DATA_KEYS.INVENTORY] &&
        Number(data[SPECIAL_DATA_KEYS.INVENTORY][variable]) > 0
      ) {
        return true;
      }
      break;
    case "!has":
      if (!data[SPECIAL_DATA_KEYS.INVENTORY]) return true;
      if (!data[SPECIAL_DATA_KEYS.INVENTORY][variable]) return true;
      return false;
      break;
    default:
      return false;
  }

  return false;
};

const checkConditionString = (conditionStr, data) => {
  let [condition, variable, operator, ref, ...otherMatch] = conditionStr.match(
    CONDITION_REGEX
  );

  // Inventory check doesn't follow the `var operator y` syntax
  // Instead it is `has item` (or `!has`)
  // So we can just swap vars around and be okay
  if (variable.indexOf("has") >= 0) {
    let realOperator = variable;
    variable = operator;
    operator = realOperator;
  }

  return checkCondition({ data, variable, operator, ref });
};

export const inventoryFilter = (item, data) => {
  return checkConditionString(item.condition, data) ? { ...item } : null;
};

export const linkFilter = (link, data) => {
  const filteredLink = { ...link };
  const linkNameParts = filteredLink.name.split("||");

  if (linkNameParts.length < 2) return filteredLink;

  const linkName = linkNameParts[0];
  filteredLink.name = linkName;

  return checkConditionString(linkNameParts[1], data) ? filteredLink : null;
};
