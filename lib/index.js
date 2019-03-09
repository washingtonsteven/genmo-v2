"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Genmo = void 0;

var _statefulComponent = _interopRequireDefault(require("./state/statefulComponent"));

var _genmoReducers = require("./state/genmoReducers");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Genmo =
/*#__PURE__*/
function (_StatefulComponent) {
  _inherits(Genmo, _StatefulComponent);

  function Genmo(storyData) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Genmo);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Genmo).call(this, {
      storyData: storyData,
      currentPassage: function () {
        if (!storyData || !storyData.passages || !storyData.passages.length) return null;
        return storyData.passages.find(function (p) {
          return p.pid === storyData.startnode;
        });
      }(),
      data: {}
    }, _genmoReducers.reducers));

    if (!storyData || !storyData.passages || !_this.state.currentPassage) {
      throw new Error("storyData given to Genmo is invalid.");
    }

    _this.outputFunction = opts.outputFunction || console && console.log || _this.noop;
    _this.errorFunction = opts.errorFunction || console && console.warn || _this.noop;
    return _this;
  }

  _createClass(Genmo, [{
    key: "outputCurrentPassage",
    value: function outputCurrentPassage() {
      return this.outputFunction(this.getCurrentPassage());
    }
  }, {
    key: "getCurrentPassage",
    value: function getCurrentPassage() {
      var _this2 = this;

      var passage = _objectSpread({}, this.state.currentPassage);

      passage.passageText = this.getPassageText(passage);
      passage.links = passage.links.map(function (link) {
        return (0, _utils.linkFilter)(link, _this2.state.data);
      }).filter(function (l) {
        return l;
      });
      return passage;
    }
  }, {
    key: "getPassageText",
    value: function getPassageText(passage) {
      if (!passage || !passage.text) return null;
      var parts = passage.text.split(_genmoReducers.DIVIDER);
      var text = parts[0];
      return (0, _utils.replaceVariables)(text, this.state.data);
    }
  }, {
    key: "followLink",
    value: function followLink(link, callback) {
      if (!link) {
        return this.errorFunction(_objectSpread({}, _utils.ERRORS.InvalidLinkError, {
          message: "Link supplied to followLink was ".concat(_typeof(link), ", which is invalid")
        }));
      }

      var pid = link;

      if (link.hasOwnProperty("pid")) {
        pid = link.pid;
      }

      var activeLink = this.state.currentPassage.links.find(function (l) {
        return l.pid === pid;
      });

      if (!activeLink) {
        return this.errorFunction(_objectSpread({}, _utils.ERRORS.LinkNotFoundError, {
          message: "Tried to activate a link to ".concat(pid, ", but that isn't a link on the current passage")
        }));
      }

      var nextPassage = this.state.storyData.passages.find(function (p) {
        return p.pid === activeLink.pid;
      });

      if (!nextPassage) {
        return this.errorFunction(_objectSpread({}, _utils.ERRORS.PassageNotFoundError, {
          message: "Link said to go to passage with id:".concat(activeLink.pid, ", but that isn't a passage.")
        }));
      }

      for (var _len = arguments.length, callbackArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        callbackArgs[_key - 2] = arguments[_key];
      }

      this.doAction.apply(this, [_objectSpread({}, _genmoReducers.ACTIONS.FOLLOW_LINK, {
        link: activeLink,
        nextPassage: nextPassage
      }), callback].concat(callbackArgs));
    }
  }, {
    key: "respondToPrompt",
    value: function respondToPrompt(response, callback) {
      var responseEntries = Object.entries(response);

      var _ref = function () {
        if (responseEntries.length) {
          return responseEntries[0];
        }

        return [null, null];
      }(),
          _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      for (var _len2 = arguments.length, callbackArgs = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        callbackArgs[_key2 - 2] = arguments[_key2];
      }

      this.doAction.apply(this, [_objectSpread({}, _genmoReducers.ACTIONS.PROMPT_ANSWER, {
        key: key,
        value: value,
        pid: this.state.currentPassage.pid
      }), callback].concat(callbackArgs));
    }
  }, {
    key: "noop",
    value: function noop() {}
  }]);

  return Genmo;
}(_statefulComponent.default);

exports.Genmo = Genmo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJHZW5tbyIsInN0b3J5RGF0YSIsIm9wdHMiLCJjdXJyZW50UGFzc2FnZSIsInBhc3NhZ2VzIiwibGVuZ3RoIiwiZmluZCIsInAiLCJwaWQiLCJzdGFydG5vZGUiLCJkYXRhIiwicmVkdWNlcnMiLCJzdGF0ZSIsIkVycm9yIiwib3V0cHV0RnVuY3Rpb24iLCJjb25zb2xlIiwibG9nIiwibm9vcCIsImVycm9yRnVuY3Rpb24iLCJ3YXJuIiwiZ2V0Q3VycmVudFBhc3NhZ2UiLCJwYXNzYWdlIiwicGFzc2FnZVRleHQiLCJnZXRQYXNzYWdlVGV4dCIsImxpbmtzIiwibWFwIiwibGluayIsImZpbHRlciIsImwiLCJ0ZXh0IiwicGFydHMiLCJzcGxpdCIsIkRJVklERVIiLCJjYWxsYmFjayIsIkVSUk9SUyIsIkludmFsaWRMaW5rRXJyb3IiLCJtZXNzYWdlIiwiaGFzT3duUHJvcGVydHkiLCJhY3RpdmVMaW5rIiwiTGlua05vdEZvdW5kRXJyb3IiLCJuZXh0UGFzc2FnZSIsIlBhc3NhZ2VOb3RGb3VuZEVycm9yIiwiY2FsbGJhY2tBcmdzIiwiZG9BY3Rpb24iLCJhY3Rpb25zIiwiRk9MTE9XX0xJTksiLCJyZXNwb25zZSIsInJlc3BvbnNlRW50cmllcyIsIk9iamVjdCIsImVudHJpZXMiLCJrZXkiLCJ2YWx1ZSIsIlBST01QVF9BTlNXRVIiLCJTdGF0ZWZ1bENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRWFBLEs7Ozs7O0FBQ1gsaUJBQVlDLFNBQVosRUFBa0M7QUFBQTs7QUFBQSxRQUFYQyxJQUFXLHVFQUFKLEVBQUk7O0FBQUE7O0FBQ2hDLCtFQUNFO0FBQ0VELE1BQUFBLFNBQVMsRUFBVEEsU0FERjtBQUVFRSxNQUFBQSxjQUFjLEVBQUcsWUFBTTtBQUNyQixZQUFJLENBQUNGLFNBQUQsSUFBYyxDQUFDQSxT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MEJLO0FBTG5DLFVBT0V5QixRQVBGLFNBUUtTLFlBUkw7QUFVRDs7OzJCQUNNLENBQUU7Ozs7RUE5R2dCVywwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdGF0ZWZ1bENvbXBvbmVudCBmcm9tIFwiLi9zdGF0ZS9zdGF0ZWZ1bENvbXBvbmVudFwiO1xuaW1wb3J0IHsgQUNUSU9OUyBhcyBhY3Rpb25zLCByZWR1Y2VycywgRElWSURFUiB9IGZyb20gXCIuL3N0YXRlL2dlbm1vUmVkdWNlcnNcIjtcbmltcG9ydCB7IGxpbmtGaWx0ZXIsIEVSUk9SUywgcmVwbGFjZVZhcmlhYmxlcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBjbGFzcyBHZW5tbyBleHRlbmRzIFN0YXRlZnVsQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3Ioc3RvcnlEYXRhLCBvcHRzID0ge30pIHtcbiAgICBzdXBlcihcbiAgICAgIHtcbiAgICAgICAgc3RvcnlEYXRhLFxuICAgICAgICBjdXJyZW50UGFzc2FnZTogKCgpID0+IHtcbiAgICAgICAgICBpZiAoIXN0b3J5RGF0YSB8fCAhc3RvcnlEYXRhLnBhc3NhZ2VzIHx8ICFzdG9yeURhdGEucGFzc2FnZXMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICByZXR1cm4gc3RvcnlEYXRhLnBhc3NhZ2VzLmZpbmQocCA9PiBwLnBpZCA9PT0gc3RvcnlEYXRhLnN0YXJ0bm9kZSk7XG4gICAgICAgIH0pKCksXG4gICAgICAgIGRhdGE6IHt9XG4gICAgICB9LFxuICAgICAgcmVkdWNlcnNcbiAgICApO1xuXG4gICAgaWYgKCFzdG9yeURhdGEgfHwgIXN0b3J5RGF0YS5wYXNzYWdlcyB8fCAhdGhpcy5zdGF0ZS5jdXJyZW50UGFzc2FnZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBzdG9yeURhdGEgZ2l2ZW4gdG8gR2VubW8gaXMgaW52YWxpZC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLm91dHB1dEZ1bmN0aW9uID1cbiAgICAgIG9wdHMub3V0cHV0RnVuY3Rpb24gfHwgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpIHx8IHRoaXMubm9vcDtcbiAgICB0aGlzLmVycm9yRnVuY3Rpb24gPVxuICAgICAgb3B0cy5lcnJvckZ1bmN0aW9uIHx8IChjb25zb2xlICYmIGNvbnNvbGUud2FybikgfHwgdGhpcy5ub29wO1xuICB9XG4gIG91dHB1dEN1cnJlbnRQYXNzYWdlKCkge1xuICAgIHJldHVybiB0aGlzLm91dHB1dEZ1bmN0aW9uKHRoaXMuZ2V0Q3VycmVudFBhc3NhZ2UoKSk7XG4gIH1cbiAgZ2V0Q3VycmVudFBhc3NhZ2UoKSB7XG4gICAgY29uc3QgcGFzc2FnZSA9IHtcbiAgICAgIC4uLnRoaXMuc3RhdGUuY3VycmVudFBhc3NhZ2VcbiAgICB9O1xuXG4gICAgcGFzc2FnZS5wYXNzYWdlVGV4dCA9IHRoaXMuZ2V0UGFzc2FnZVRleHQocGFzc2FnZSk7XG5cbiAgICBwYXNzYWdlLmxpbmtzID0gcGFzc2FnZS5saW5rc1xuICAgICAgLm1hcChsaW5rID0+IGxpbmtGaWx0ZXIobGluaywgdGhpcy5zdGF0ZS5kYXRhKSlcbiAgICAgIC5maWx0ZXIobCA9PiBsKTtcblxuICAgIHJldHVybiBwYXNzYWdlO1xuICB9XG4gIGdldFBhc3NhZ2VUZXh0KHBhc3NhZ2UpIHtcbiAgICBpZiAoIXBhc3NhZ2UgfHwgIXBhc3NhZ2UudGV4dCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgcGFydHMgPSBwYXNzYWdlLnRleHQuc3BsaXQoRElWSURFUik7XG4gICAgY29uc3QgdGV4dCA9IHBhcnRzWzBdO1xuXG4gICAgcmV0dXJuIHJlcGxhY2VWYXJpYWJsZXModGV4dCwgdGhpcy5zdGF0ZS5kYXRhKTtcbiAgfVxuICBmb2xsb3dMaW5rKGxpbmssIGNhbGxiYWNrLCAuLi5jYWxsYmFja0FyZ3MpIHtcbiAgICBpZiAoIWxpbmspIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yRnVuY3Rpb24oe1xuICAgICAgICAuLi5FUlJPUlMuSW52YWxpZExpbmtFcnJvcixcbiAgICAgICAgbWVzc2FnZTogYExpbmsgc3VwcGxpZWQgdG8gZm9sbG93TGluayB3YXMgJHt0eXBlb2YgbGlua30sIHdoaWNoIGlzIGludmFsaWRgXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgcGlkID0gbGluaztcbiAgICBpZiAobGluay5oYXNPd25Qcm9wZXJ0eShcInBpZFwiKSkge1xuICAgICAgcGlkID0gbGluay5waWQ7XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlTGluayA9IHRoaXMuc3RhdGUuY3VycmVudFBhc3NhZ2UubGlua3MuZmluZChsID0+IGwucGlkID09PSBwaWQpO1xuICAgIGlmICghYWN0aXZlTGluaykge1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3JGdW5jdGlvbih7XG4gICAgICAgIC4uLkVSUk9SUy5MaW5rTm90Rm91bmRFcnJvcixcbiAgICAgICAgbWVzc2FnZTogYFRyaWVkIHRvIGFjdGl2YXRlIGEgbGluayB0byAke3BpZH0sIGJ1dCB0aGF0IGlzbid0IGEgbGluayBvbiB0aGUgY3VycmVudCBwYXNzYWdlYFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV4dFBhc3NhZ2UgPSB0aGlzLnN0YXRlLnN0b3J5RGF0YS5wYXNzYWdlcy5maW5kKFxuICAgICAgcCA9PiBwLnBpZCA9PT0gYWN0aXZlTGluay5waWRcbiAgICApO1xuICAgIGlmICghbmV4dFBhc3NhZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmVycm9yRnVuY3Rpb24oe1xuICAgICAgICAuLi5FUlJPUlMuUGFzc2FnZU5vdEZvdW5kRXJyb3IsXG4gICAgICAgIG1lc3NhZ2U6IGBMaW5rIHNhaWQgdG8gZ28gdG8gcGFzc2FnZSB3aXRoIGlkOiR7XG4gICAgICAgICAgYWN0aXZlTGluay5waWRcbiAgICAgICAgfSwgYnV0IHRoYXQgaXNuJ3QgYSBwYXNzYWdlLmBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZG9BY3Rpb24oXG4gICAgICB7XG4gICAgICAgIC4uLmFjdGlvbnMuRk9MTE9XX0xJTkssXG4gICAgICAgIGxpbms6IGFjdGl2ZUxpbmssXG4gICAgICAgIG5leHRQYXNzYWdlXG4gICAgICB9LFxuICAgICAgY2FsbGJhY2ssXG4gICAgICAuLi5jYWxsYmFja0FyZ3NcbiAgICApO1xuICB9XG4gIHJlc3BvbmRUb1Byb21wdChyZXNwb25zZSwgY2FsbGJhY2ssIC4uLmNhbGxiYWNrQXJncykge1xuICAgIGNvbnN0IHJlc3BvbnNlRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHJlc3BvbnNlKTtcbiAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSAoKCkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlRW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlRW50cmllc1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbbnVsbCwgbnVsbF07XG4gICAgfSkoKTtcbiAgICB0aGlzLmRvQWN0aW9uKFxuICAgICAge1xuICAgICAgICAuLi5hY3Rpb25zLlBST01QVF9BTlNXRVIsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHBpZDogdGhpcy5zdGF0ZS5jdXJyZW50UGFzc2FnZS5waWRcbiAgICAgIH0sXG4gICAgICBjYWxsYmFjayxcbiAgICAgIC4uLmNhbGxiYWNrQXJnc1xuICAgICk7XG4gIH1cbiAgbm9vcCgpIHt9XG59XG4iXX0=