"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducers = exports.DIVIDER = exports.ACTIONS = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ACTIONS = {
  FOLLOW_LINK: {
    type: "FOLLOW_LINK",
    link: null
  }
};
exports.ACTIONS = ACTIONS;
var DIVIDER = "\n---\n";
exports.DIVIDER = DIVIDER;

function followLinkReducer(state, action) {
  if (action.type === ACTIONS.FOLLOW_LINK.type) {
    var currentPassage = action.nextPassage;

    var data = _objectSpread({}, state.data);

    var newDataJSON = function () {
      var parts = action.nextPassage.text.split(DIVIDER);
      return parts[parts.length - 1];
    }();

    var newData;

    try {
      newData = JSON.parse(newDataJSON);
    } catch (e) {
      if (action.nextPassage.text.split(DIVIDER).length >= 3) {
        console.warn("Couldn't properly parse data for ".concat(currentPassage.name, " (").concat(currentPassage.pid, ")"));
      }
    }

    if (newData) {
      Object.entries(newData).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        var numericMatch = value.match(/^(--|\+\+)(\d+)/);

        if (numericMatch) {
          if (!data[key]) {
            data[key] = 0;
          }

          var operation = numericMatch[1] === "--" ? -1 : 1;
          var abs_delta = +numericMatch[2];
          var delta = abs_delta * operation;
          console.log({
            operation: operation,
            abs_delta: abs_delta,
            delta: delta,
            numericMatch: numericMatch
          });
          data[key] += delta;
        } else {
          if (value === "null") {
            data[key] = null;
          } else {
            data[key] = value;
          }
        }
      });
    }

    return _objectSpread({}, state, {
      currentPassage: currentPassage,
      data: data
    });
  }
}

var reducers = [followLinkReducer];
exports.reducers = reducers;