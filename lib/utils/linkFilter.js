"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CONDITION_REGEX = /(.+)\s(.+)\s(.+)/;
var numberOperators = ["lt", "gt", "lte", "gte"];

var checkCondition = function checkCondition(_ref) {
  var data = _ref.data,
      variable = _ref.variable,
      operator = _ref.operator,
      ref = _ref.ref;

  switch (operator) {
    case "gte":
      {
        if (Number(data[variable]) >= Number(ref)) {
          return true;
        }
      }

    case "lte":
      {
        if (Number(data[variable]) <= Number(ref)) {
          return true;
        }
      }

    case "lt":
      {
        if (Number(data[variable]) < Number(ref)) {
          return true;
        }
      }

    case "gt":
      {
        if (Number(data[variable]) < Number(ref)) {
          return true;
        }
      }

    case "eq":
      {
        if (data[variable] == ref) {
          return true;
        }
      }

    case "seq":
      {
        // strict equals
        if (data[variable] === ref) {
          return true;
        }
      }

    default:
      {
        return null;
      }
  }
};

var linkFilter = function linkFilter(link, data) {
  var filteredLink = _objectSpread({}, link);

  var linkNameParts = filteredLink.name.split("||");
  if (linkNameParts.length < 2) return filteredLink;
  var linkName = linkNameParts[0];

  var _linkNameParts$1$matc = linkNameParts[1].match(CONDITION_REGEX),
      _linkNameParts$1$matc2 = _toArray(_linkNameParts$1$matc),
      condition = _linkNameParts$1$matc2[0],
      variable = _linkNameParts$1$matc2[1],
      operator = _linkNameParts$1$matc2[2],
      ref = _linkNameParts$1$matc2[3],
      otherMatch = _linkNameParts$1$matc2.slice(4);

  filteredLink.name = linkName;

  if (!data[variable]) {
    return null;
  }

  if (numberOperators.indexOf(operator) >= 0) {
    if (isNaN(Number(data[variable])) || isNaN(Number(ref))) {
      return null;
    }
  }

  return checkCondition({
    data: data,
    variable: variable,
    operator: operator,
    ref: ref
  }) ? filteredLink : null;
};

var _default = linkFilter;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9saW5rRmlsdGVyLmpzIl0sIm5hbWVzIjpbIkNPTkRJVElPTl9SRUdFWCIsIm51bWJlck9wZXJhdG9ycyIsImNoZWNrQ29uZGl0aW9uIiwiZGF0YSIsInZhcmlhYmxlIiwib3BlcmF0b3IiLCJyZWYiLCJOdW1iZXIiLCJsaW5rRmlsdGVyIiwibGluayIsImZpbHRlcmVkTGluayIsImxpbmtOYW1lUGFydHMiLCJuYW1lIiwic3BsaXQiLCJsZW5ndGgiLCJsaW5rTmFtZSIsIm1hdGNoIiwiY29uZGl0aW9uIiwib3RoZXJNYXRjaCIsImluZGV4T2YiLCJpc05hTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLGVBQWUsR0FBRyxrQkFBeEI7QUFFQSxJQUFNQyxlQUFlLEdBQUcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWIsRUFBb0IsS0FBcEIsQ0FBeEI7O0FBRUEsSUFBTUMsY0FBYyxHQUFHLFNBQWpCQSxjQUFpQixPQUF1QztBQUFBLE1BQXBDQyxJQUFvQyxRQUFwQ0EsSUFBb0M7QUFBQSxNQUE5QkMsUUFBOEIsUUFBOUJBLFFBQThCO0FBQUEsTUFBcEJDLFFBQW9CLFFBQXBCQSxRQUFvQjtBQUFBLE1BQVZDLEdBQVUsUUFBVkEsR0FBVTs7QUFDNUQsVUFBUUQsUUFBUjtBQUNFLFNBQUssS0FBTDtBQUFZO0FBQ1YsWUFBSUUsTUFBTSxDQUFDSixJQUFJLENBQUNDLFFBQUQsQ0FBTCxDQUFOLElBQTBCRyxNQUFNLENBQUNELEdBQUQsQ0FBcEMsRUFBMkM7QUFDekMsaUJBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBSyxLQUFMO0FBQVk7QUFDVixZQUFJQyxNQUFNLENBQUNKLElBQUksQ0FBQ0MsUUFBRCxDQUFMLENBQU4sSUFBMEJHLE1BQU0sQ0FBQ0QsR0FBRCxDQUFwQyxFQUEyQztBQUN6QyxpQkFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFDRCxTQUFLLElBQUw7QUFBVztBQUNULFlBQUlDLE1BQU0sQ0FBQ0osSUFBSSxDQUFDQyxRQUFELENBQUwsQ0FBTixHQUF5QkcsTUFBTSxDQUFDRCxHQUFELENBQW5DLEVBQTBDO0FBQ3hDLGlCQUFPLElBQVA7QUFDRDtBQUNGOztBQUNELFNBQUssSUFBTDtBQUFXO0FBQ1QsWUFBSUMsTUFBTSxDQUFDSixJQUFJLENBQUNDLFFBQUQsQ0FBTCxDQUFOLEdBQXlCRyxNQUFNLENBQUNELEdBQUQsQ0FBbkMsRUFBMEM7QUFDeEMsaUJBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBSyxJQUFMO0FBQVc7QUFDVCxZQUFJSCxJQUFJLENBQUNDLFFBQUQsQ0FBSixJQUFrQkUsR0FBdEIsRUFBMkI7QUFDekIsaUJBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsU0FBSyxLQUFMO0FBQVk7QUFDVjtBQUNBLFlBQUlILElBQUksQ0FBQ0MsUUFBRCxDQUFKLEtBQW1CRSxHQUF2QixFQUE0QjtBQUMxQixpQkFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFDRDtBQUFTO0FBQ1AsZUFBTyxJQUFQO0FBQ0Q7QUFsQ0g7QUFvQ0QsQ0FyQ0Q7O0FBdUNBLElBQU1FLFVBQVUsR0FBRyxTQUFiQSxVQUFhLENBQUNDLElBQUQsRUFBT04sSUFBUCxFQUFnQjtBQUNqQyxNQUFNTyxZQUFZLHFCQUFRRCxJQUFSLENBQWxCOztBQUNBLE1BQU1FLGFBQWEsR0FBR0QsWUFBWSxDQUFDRSxJQUFiLENBQWtCQyxLQUFsQixDQUF3QixJQUF4QixDQUF0QjtBQUVBLE1BQUlGLGFBQWEsQ0FBQ0csTUFBZCxHQUF1QixDQUEzQixFQUE4QixPQUFPSixZQUFQO0FBRTlCLE1BQU1LLFFBQVEsR0FBR0osYUFBYSxDQUFDLENBQUQsQ0FBOUI7O0FBTmlDLDhCQWE3QkEsYUFBYSxDQUFDLENBQUQsQ0FBYixDQUFpQkssS0FBakIsQ0FBdUJoQixlQUF2QixDQWI2QjtBQUFBO0FBQUEsTUFRL0JpQixTQVIrQjtBQUFBLE1BUy9CYixRQVQrQjtBQUFBLE1BVS9CQyxRQVYrQjtBQUFBLE1BVy9CQyxHQVgrQjtBQUFBLE1BWTVCWSxVQVo0Qjs7QUFlakNSLEVBQUFBLFlBQVksQ0FBQ0UsSUFBYixHQUFvQkcsUUFBcEI7O0FBRUEsTUFBSSxDQUFDWixJQUFJLENBQUNDLFFBQUQsQ0FBVCxFQUFxQjtBQUNuQixXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJSCxlQUFlLENBQUNrQixPQUFoQixDQUF3QmQsUUFBeEIsS0FBcUMsQ0FBekMsRUFBNEM7QUFDMUMsUUFBSWUsS0FBSyxDQUFDYixNQUFNLENBQUNKLElBQUksQ0FBQ0MsUUFBRCxDQUFMLENBQVAsQ0FBTCxJQUFpQ2dCLEtBQUssQ0FBQ2IsTUFBTSxDQUFDRCxHQUFELENBQVAsQ0FBMUMsRUFBeUQ7QUFDdkQsYUFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPSixjQUFjLENBQUM7QUFBRUMsSUFBQUEsSUFBSSxFQUFKQSxJQUFGO0FBQVFDLElBQUFBLFFBQVEsRUFBUkEsUUFBUjtBQUFrQkMsSUFBQUEsUUFBUSxFQUFSQSxRQUFsQjtBQUE0QkMsSUFBQUEsR0FBRyxFQUFIQTtBQUE1QixHQUFELENBQWQsR0FDSEksWUFERyxHQUVILElBRko7QUFHRCxDQTlCRDs7ZUFnQ2VGLFUiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDT05ESVRJT05fUkVHRVggPSAvKC4rKVxccyguKylcXHMoLispLztcblxuY29uc3QgbnVtYmVyT3BlcmF0b3JzID0gW1wibHRcIiwgXCJndFwiLCBcImx0ZVwiLCBcImd0ZVwiXTtcblxuY29uc3QgY2hlY2tDb25kaXRpb24gPSAoeyBkYXRhLCB2YXJpYWJsZSwgb3BlcmF0b3IsIHJlZiB9KSA9PiB7XG4gIHN3aXRjaCAob3BlcmF0b3IpIHtcbiAgICBjYXNlIFwiZ3RlXCI6IHtcbiAgICAgIGlmIChOdW1iZXIoZGF0YVt2YXJpYWJsZV0pID49IE51bWJlcihyZWYpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXNlIFwibHRlXCI6IHtcbiAgICAgIGlmIChOdW1iZXIoZGF0YVt2YXJpYWJsZV0pIDw9IE51bWJlcihyZWYpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXNlIFwibHRcIjoge1xuICAgICAgaWYgKE51bWJlcihkYXRhW3ZhcmlhYmxlXSkgPCBOdW1iZXIocmVmKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgY2FzZSBcImd0XCI6IHtcbiAgICAgIGlmIChOdW1iZXIoZGF0YVt2YXJpYWJsZV0pIDwgTnVtYmVyKHJlZikpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGNhc2UgXCJlcVwiOiB7XG4gICAgICBpZiAoZGF0YVt2YXJpYWJsZV0gPT0gcmVmKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjYXNlIFwic2VxXCI6IHtcbiAgICAgIC8vIHN0cmljdCBlcXVhbHNcbiAgICAgIGlmIChkYXRhW3ZhcmlhYmxlXSA9PT0gcmVmKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IGxpbmtGaWx0ZXIgPSAobGluaywgZGF0YSkgPT4ge1xuICBjb25zdCBmaWx0ZXJlZExpbmsgPSB7IC4uLmxpbmsgfTtcbiAgY29uc3QgbGlua05hbWVQYXJ0cyA9IGZpbHRlcmVkTGluay5uYW1lLnNwbGl0KFwifHxcIik7XG5cbiAgaWYgKGxpbmtOYW1lUGFydHMubGVuZ3RoIDwgMikgcmV0dXJuIGZpbHRlcmVkTGluaztcblxuICBjb25zdCBsaW5rTmFtZSA9IGxpbmtOYW1lUGFydHNbMF07XG4gIGNvbnN0IFtcbiAgICBjb25kaXRpb24sXG4gICAgdmFyaWFibGUsXG4gICAgb3BlcmF0b3IsXG4gICAgcmVmLFxuICAgIC4uLm90aGVyTWF0Y2hcbiAgXSA9IGxpbmtOYW1lUGFydHNbMV0ubWF0Y2goQ09ORElUSU9OX1JFR0VYKTtcblxuICBmaWx0ZXJlZExpbmsubmFtZSA9IGxpbmtOYW1lO1xuXG4gIGlmICghZGF0YVt2YXJpYWJsZV0pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChudW1iZXJPcGVyYXRvcnMuaW5kZXhPZihvcGVyYXRvcikgPj0gMCkge1xuICAgIGlmIChpc05hTihOdW1iZXIoZGF0YVt2YXJpYWJsZV0pKSB8fCBpc05hTihOdW1iZXIocmVmKSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjaGVja0NvbmRpdGlvbih7IGRhdGEsIHZhcmlhYmxlLCBvcGVyYXRvciwgcmVmIH0pXG4gICAgPyBmaWx0ZXJlZExpbmtcbiAgICA6IG51bGw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBsaW5rRmlsdGVyO1xuIl19