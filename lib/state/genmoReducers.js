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
  },
  PROMPT_ANSWER: {
    type: "PROMPT_ANSWER",
    data: {}
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
          data[key] += delta;
        } else {
          if (value === "null") {
            data[key] = null;
          } else if (value === ">>") {
            if (!data[key]) {
              if (!currentPassage.needsPrompt) currentPassage.needsPrompt = [];
              var keyIndex = currentPassage.needsPrompt.findIndex(function (p) {
                return p.key === key;
              });
              if (keyIndex < 0) currentPassage.needsPrompt.push({
                key: key
              });
            }
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

function promptAnswerReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 ? arguments[1] : undefined;

  if (action.type === ACTIONS.PROMPT_ANSWER.type) {
    var newState = _objectSpread({}, state);

    var targetPassage = newState.storyData.passages.find(function (p) {
      return p.pid === action.pid;
    });
    targetPassage.needsPrompt = targetPassage.needsPrompt.map(function (prompt) {
      if (prompt.key === action.key) {
        return _objectSpread({}, prompt, {
          complete: true
        });
      }

      return prompt;
    });
    newState.currentPassage = targetPassage;
    newState.data = _objectSpread({}, newState.data, _defineProperty({}, action.key, action.value));
    return newState;
  }
}

var reducers = [followLinkReducer, promptAnswerReducer];
exports.reducers = reducers;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdGF0ZS9nZW5tb1JlZHVjZXJzLmpzIl0sIm5hbWVzIjpbIkFDVElPTlMiLCJGT0xMT1dfTElOSyIsInR5cGUiLCJsaW5rIiwiUFJPTVBUX0FOU1dFUiIsImRhdGEiLCJESVZJREVSIiwiZm9sbG93TGlua1JlZHVjZXIiLCJzdGF0ZSIsImFjdGlvbiIsImN1cnJlbnRQYXNzYWdlIiwibmV4dFBhc3NhZ2UiLCJuZXdEYXRhSlNPTiIsInBhcnRzIiwidGV4dCIsInNwbGl0IiwibGVuZ3RoIiwibmV3RGF0YSIsIkpTT04iLCJwYXJzZSIsImUiLCJjb25zb2xlIiwid2FybiIsIm5hbWUiLCJwaWQiLCJPYmplY3QiLCJlbnRyaWVzIiwiZm9yRWFjaCIsImtleSIsInZhbHVlIiwibnVtZXJpY01hdGNoIiwibWF0Y2giLCJvcGVyYXRpb24iLCJhYnNfZGVsdGEiLCJkZWx0YSIsIm5lZWRzUHJvbXB0Iiwia2V5SW5kZXgiLCJmaW5kSW5kZXgiLCJwIiwicHVzaCIsInByb21wdEFuc3dlclJlZHVjZXIiLCJuZXdTdGF0ZSIsInRhcmdldFBhc3NhZ2UiLCJzdG9yeURhdGEiLCJwYXNzYWdlcyIsImZpbmQiLCJtYXAiLCJwcm9tcHQiLCJjb21wbGV0ZSIsInJlZHVjZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sSUFBTUEsT0FBTyxHQUFHO0FBQ3JCQyxFQUFBQSxXQUFXLEVBQUU7QUFDWEMsSUFBQUEsSUFBSSxFQUFFLGFBREs7QUFFWEMsSUFBQUEsSUFBSSxFQUFFO0FBRkssR0FEUTtBQUtyQkMsRUFBQUEsYUFBYSxFQUFFO0FBQ2JGLElBQUFBLElBQUksRUFBRSxlQURPO0FBRWJHLElBQUFBLElBQUksRUFBRTtBQUZPO0FBTE0sQ0FBaEI7O0FBV0EsSUFBTUMsT0FBTyxHQUFHLFNBQWhCOzs7QUFFUCxTQUFTQyxpQkFBVCxDQUEyQkMsS0FBM0IsRUFBa0NDLE1BQWxDLEVBQTBDO0FBQ3hDLE1BQUlBLE1BQU0sQ0FBQ1As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RCxTQUFTbUMsbUJBQVQsR0FBaUQ7QUFBQSxNQUFwQmhDLEtBQW9CLHVFQUFaLEVBQVk7QUFBQSxNQUFSQyxNQUFROztBQUMvQyxNQUFJQSxNQUFNLENBQUNQLElBQVAsS0FBZ0JGLE9BQU8sQ0FBQ0ksYUFBUixDQUFzQkYsSUFBMUMsRUFBZ0Q7QUFDOUMsUUFBTXVDLFFBQVEscUJBQ1RqQyxLQURTLENBQWQ7O0FBR0EsUUFBTWtDLGFBQWEsR0FBR0QsUUFBUSxDQUFDRSxTQUFULENBQW1CQyxRQUFuQixDQUE0QkMsSUFBNUIsQ0FDcEIsVUFBQVAsQ0FBQztBQUFBLGFBQUlBLENBQUMsQ0FBQ2QsR0FBRixLQUFVZixNQUFNLENBQUNlLEdBQXJCO0FBQUEsS0FEbUIsQ0FBdEI7QUFJQWtCLElBQUFBLGFBQWEsQ0FBQ1AsV0FBZCxHQUE0Qk8sYUFBYSxDQUFDUCxXQUFkLENBQTBCVyxHQUExQixDQUE4QixVQUFBQyxNQUFNLEVBQUk7QUFDbEUsVUFBSUEsTUFBTSxDQUFDbkIsR0FBUCxLQUFlbkIsTUFBTSxDQUFDbUIsR0FBMUIsRUFBK0I7QUFDN0IsaUNBQVltQixNQUFaO0FBQW9CQyxVQUFBQSxRQUFRLEVBQUU7QUFBOUI7QUFDRDs7QUFDRCxhQUFPRCxNQUFQO0FBQ0QsS0FMMkIsQ0FBNUI7QUFPQU4sSUFBQUEsUUFBUSxDQUFDL0IsY0FBVCxHQUEwQmdDLGFBQTFCO0FBRUFELElBQUFBLFFBQVEsQ0FBQ3BDLElBQVQscUJBQ0tvQyxRQUFRLENBQUNwQyxJQURkLHNCQUVHSSxNQUFNLENBQUNtQixHQUZWLEVBRWdCbkIsTUFBTSxDQUFDb0IsS0FGdkI7QUFLQSxXQUFPWSxRQUFQO0FBQ0Q7QUFDRjs7QUFFTSxJQUFNUSxRQUFRLEdBQUcsQ0FBQzFDLGlCQUFELEVBQW9CaUMsbUJBQXBCLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IEFDVElPTlMgPSB7XG4gIEZPTExPV19MSU5LOiB7XG4gICAgdHlwZTogXCJGT0xMT1dfTElOS1wiLFxuICAgIGxpbms6IG51bGxcbiAgfSxcbiAgUFJPTVBUX0FOU1dFUjoge1xuICAgIHR5cGU6IFwiUFJPTVBUX0FOU1dFUlwiLFxuICAgIGRhdGE6IHt9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBESVZJREVSID0gXCJcXG4tLS1cXG5cIjtcblxuZnVuY3Rpb24gZm9sbG93TGlua1JlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICBpZiAoYWN0aW9uLnR5cGUgPT09IEFDVElPTlMuRk9MTE9XX0xJTksudHlwZSkge1xuICAgIGNvbnN0IGN1cnJlbnRQYXNzYWdlID0gYWN0aW9uLm5leHRQYXNzYWdlO1xuICAgIGNvbnN0IGRhdGEgPSB7IC4uLnN0YXRlLmRhdGEgfTtcbiAgICBjb25zdCBuZXdEYXRhSlNPTiA9ICgoKSA9PiB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGFjdGlvbi5uZXh0UGFzc2FnZS50ZXh0LnNwbGl0KERJVklERVIpO1xuICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgIH0pKCk7XG4gICAgbGV0IG5ld0RhdGE7XG5cbiAgICB0cnkge1xuICAgICAgbmV3RGF0YSA9IEpTT04ucGFyc2UobmV3RGF0YUpTT04pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChhY3Rpb24ubmV4dFBhc3NhZ2UudGV4dC5zcGxpdChESVZJREVSKS5sZW5ndGggPj0gMykge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYENvdWxkbid0IHByb3Blcmx5IHBhcnNlIGRhdGEgZm9yICR7Y3VycmVudFBhc3NhZ2UubmFtZX0gKCR7XG4gICAgICAgICAgICBjdXJyZW50UGFzc2FnZS5waWRcbiAgICAgICAgICB9KWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmV3RGF0YSkge1xuICAgICAgT2JqZWN0LmVudHJpZXMobmV3RGF0YSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IG51bWVyaWNNYXRjaCA9IHZhbHVlLm1hdGNoKC9eKC0tfFxcK1xcKykoXFxkKykvKTtcbiAgICAgICAgaWYgKG51bWVyaWNNYXRjaCkge1xuICAgICAgICAgIGlmICghZGF0YVtrZXldKSB7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBudW1lcmljTWF0Y2hbMV0gPT09IFwiLS1cIiA/IC0xIDogMTtcbiAgICAgICAgICBjb25zdCBhYnNfZGVsdGEgPSArbnVtZXJpY01hdGNoWzJdO1xuICAgICAgICAgIGNvbnN0IGRlbHRhID0gYWJzX2RlbHRhICogb3BlcmF0aW9uO1xuXG4gICAgICAgICAgZGF0YVtrZXldICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCI+PlwiKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGFba2V5XSkge1xuICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRQYXNzYWdlLm5lZWRzUHJvbXB0KSBjdXJyZW50UGFzc2FnZS5uZWVkc1Byb21wdCA9IFtdO1xuICAgICAgICAgICAgICBjb25zdCBrZXlJbmRleCA9IGN1cnJlbnRQYXNzYWdlLm5lZWRzUHJvbXB0LmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICBwID0+IHAua2V5ID09PSBrZXlcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICBpZiAoa2V5SW5kZXggPCAwKSBjdXJyZW50UGFzc2FnZS5uZWVkc1Byb21wdC5wdXNoKHsga2V5IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIGN1cnJlbnRQYXNzYWdlLFxuICAgICAgZGF0YVxuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvbXB0QW5zd2VyUmVkdWNlcihzdGF0ZSA9IHt9LCBhY3Rpb24pIHtcbiAgaWYgKGFjdGlvbi50eXBlID09PSBBQ1RJT05TLlBST01QVF9BTlNXRVIudHlwZSkge1xuICAgIGNvbnN0IG5ld1N0YXRlID0ge1xuICAgICAgLi4uc3RhdGVcbiAgICB9O1xuICAgIGNvbnN0IHRhcmdldFBhc3NhZ2UgPSBuZXdTdGF0ZS5zdG9yeURhdGEucGFzc2FnZXMuZmluZChcbiAgICAgIHAgPT4gcC5waWQgPT09IGFjdGlvbi5waWRcbiAgICApO1xuXG4gICAgdGFyZ2V0UGFzc2FnZS5uZWVkc1Byb21wdCA9IHRhcmdldFBhc3NhZ2UubmVlZHNQcm9tcHQubWFwKHByb21wdCA9PiB7XG4gICAgICBpZiAocHJvbXB0LmtleSA9PT0gYWN0aW9uLmtleSkge1xuICAgICAgICByZXR1cm4geyAuLi5wcm9tcHQsIGNvbXBsZXRlOiB0cnVlIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbXB0O1xuICAgIH0pO1xuXG4gICAgbmV3U3RhdGUuY3VycmVudFBhc3NhZ2UgPSB0YXJnZXRQYXNzYWdlO1xuXG4gICAgbmV3U3RhdGUuZGF0YSA9IHtcbiAgICAgIC4uLm5ld1N0YXRlLmRhdGEsXG4gICAgICBbYWN0aW9uLmtleV06IGFjdGlvbi52YWx1ZVxuICAgIH07XG5cbiAgICByZXR1cm4gbmV3U3RhdGU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJlZHVjZXJzID0gW2ZvbGxvd0xpbmtSZWR1Y2VyLCBwcm9tcHRBbnN3ZXJSZWR1Y2VyXTtcbiJdfQ==