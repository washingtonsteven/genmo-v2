import { SPECIAL_DATA_KEYS } from "../state/genmoReducers";

/** @type {RegExp} The regex to parse binary/trinary conditions.  */
const CONDITION_REGEX = /(!?\w+|\d+)\s+(\w+|\d+)\s*(\w+|\d+)*/;

/** @type {String[]} The operators that require both operands to be numbers */
const numberOperators = ["lt", "gt", "lte", "gte"];

/**
 * @typedef Operation
 * @property {Object} data The source data to check against
 * @property {String} variable The variable in the data to check
 * @property {String} operator
 * @property {String} ref The value to compare `variable` to
 */

/**
 * Given the operation and data, returns whether the condition is satisfied.
 * If the operator requires numbers, and either operand is not, this function returns false.
 *
 * Valid operators: gte, lte, lt, gt, eq, seq, has (binary), !has (binary)
 *
 * @param {Operation} operation
 * @return {Boolean}
 */
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

/**
 * Parses the condition string, and returns whether the condition is satisfied
 *
 * A condition string is trinary, e.g. `varName lte 10` checks whether `data.varName` is less than or equal to 10
 *
 * There are two binary operators, `has` and `!has`. e.g. `has coin` checks whether `data.inventory` contains a coin.
 *
 * @param {String} conditionStr
 * @param {Object} data
 * @return {Boolean}
 */
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

/**
 * Returns the item if the condition is met, otherwise returns null.
 *
 * @param {String} item
 * @param {Object} data
 * @return {Object|null}
 */
export const inventoryFilter = (item, data) => {
  return checkConditionString(item.condition, data) ? { ...item } : null;
};

/**
 * Returns the link if the condition in the link is met, otherwise null.
 * Link conditions use `||` to separate the link name from its condition.
 * @param {Link} link
 * @param {Object} data
 * @return {Link|null}
 */
export const linkFilter = (link, data) => {
  const filteredLink = { ...link };
  const linkNameParts = filteredLink.name.split("||");

  if (linkNameParts.length < 2) return filteredLink;

  const linkName = linkNameParts[0];
  filteredLink.name = linkName;

  return checkConditionString(linkNameParts[1], data) ? filteredLink : null;
};
