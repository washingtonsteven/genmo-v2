"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Genmo = exports.ERRORS = void 0;

var _statefulComponent = _interopRequireDefault(require("./state/stateful-component"));

var _genmoReducers = require("./state/genmo-reducers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var ERRORS = {
  InvalidLinkError: {
    type: "InvalidLinkError",
    code: 1,
    message: "Link supplied to followLink was invalid."
  },
  LinkNotFoundError: {
    type: "LinkNotFoundError",
    code: 2,
    message: "Tried to activate a link, but it wasn't present on the currentPassage"
  },
  PassageNotFoundError: {
    type: "PassageNotFoundError",
    code: 3,
    message: "Could not find passage"
  }
};
exports.ERRORS = ERRORS;

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
      return this.outputFunction(_objectSpread({
        passageText: this.getPassageText(this.state.currentPassage)
      }, this.state.currentPassage));
    }
  }, {
    key: "getPassageText",
    value: function getPassageText(passage) {
      if (!passage || !passage.text) return null;
      var parts = passage.text.split(_genmoReducers.DIVIDER);
      return parts[0];
    }
  }, {
    key: "followLink",
    value: function followLink(link, callback) {
      if (!link) {
        return this.errorFunction(_objectSpread({}, ERRORS.InvalidLinkError, {
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
        return this.errorFunction(_objectSpread({}, ERRORS.LinkNotFoundError, {
          message: "Tried to activate a link to ".concat(pid, ", but that isn't a link on the current passage")
        }));
      }

      var nextPassage = this.state.storyData.passages.find(function (p) {
        return p.pid === activeLink.pid;
      });

      if (!nextPassage) {
        return this.errorFunction(_objectSpread({}, ERRORS.PassageNotFoundError, {
          message: "Link said to go to passage with id:".concat(activeLink.pid, ", but that isn't a passage.")
        }));
      }

      this.doAction(_objectSpread({}, _genmoReducers.ACTIONS.FOLLOW_LINK, {
        link: activeLink,
        nextPassage: nextPassage
      }));
    }
  }, {
    key: "noop",
    value: function noop() {}
  }]);

  return Genmo;
}(_statefulComponent.default);

exports.Genmo = Genmo;