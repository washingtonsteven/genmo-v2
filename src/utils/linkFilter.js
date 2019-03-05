const CONDITION_REGEX = /(.+)\s(.+)\s(.+)/;

const numberOperators = ["lt", "gt", "lte", "gte"];

const checkCondition = ({ data, variable, operator, ref }) => {
  switch (operator) {
    case "gte": {
      if (Number(data[variable]) >= Number(ref)) {
        return true;
      }
    }
    case "lte": {
      if (Number(data[variable]) <= Number(ref)) {
        return true;
      }
    }
    case "lt": {
      if (Number(data[variable]) < Number(ref)) {
        return true;
      }
    }
    case "gt": {
      if (Number(data[variable]) < Number(ref)) {
        return true;
      }
    }
    case "eq": {
      if (data[variable] == ref) {
        return true;
      }
    }
    case "seq": {
      // strict equals
      if (data[variable] === ref) {
        return true;
      }
    }
    default: {
      return null;
    }
  }
};

const linkFilter = (link, data) => {
  const filteredLink = { ...link };
  const linkNameParts = filteredLink.name.split("||");

  if (linkNameParts.length < 2) return filteredLink;

  const linkName = linkNameParts[0];
  const [
    condition,
    variable,
    operator,
    ref,
    ...otherMatch
  ] = linkNameParts[1].match(CONDITION_REGEX);

  filteredLink.name = linkName;

  if (!data[variable]) {
    return null;
  }

  if (numberOperators.indexOf(operator) >= 0) {
    if (isNaN(Number(data[variable])) || isNaN(Number(ref))) {
      return null;
    }
  }

  return checkCondition({ data, variable, operator, ref })
    ? filteredLink
    : null;
};

export default linkFilter;
