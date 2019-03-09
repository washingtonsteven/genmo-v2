"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var StatefulComponent =
/*#__PURE__*/
function () {
  function StatefulComponent() {
    var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var reducers = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, StatefulComponent);

    this.state = _objectSpread({}, initialState);
    this.reducers = [];
    this.actions = [];
    this.addReducer(reducers);
  }

  _createClass(StatefulComponent, [{
    key: "addReducer",
    value: function addReducer(fn) {
      if (!Array.isArray(fn)) fn = [fn];
      this.reducers = this.reducers.concat(fn).filter(function (f) {
        return typeof f === "function";
      });
    }
  }, {
    key: "setState",
    value: function setState(newState, callback) {
      if (typeof newState === "function") {
        newState = newState(this.state);
      }

      this.state = _objectSpread({}, this.state, newState);
      this.doCallback(callback);
    }
  }, {
    key: "doAction",
    value: function doAction(action, callback) {
      var _this = this;

      var updatedState = this.state;
      this.reducers.forEach(function (r) {
        _this.setState(r(updatedState, action));
      });
      this.actions.push(action);

      for (var _len = arguments.length, callbackArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        callbackArgs[_key - 2] = arguments[_key];
      }

      this.doCallback.apply(this, [callback].concat(callbackArgs));
    }
  }, {
    key: "doCallback",
    value: function doCallback(callback) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (typeof callback === "function") callback.apply(void 0, args);
    }
  }]);

  return StatefulComponent;
}();

var _default = StatefulComponent;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdGF0ZS9zdGF0ZWZ1bENvbXBvbmVudC5qcyJdLCJuYW1lcyI6WyJTdGF0ZWZ1bENvbXBvbmVudCIsImluaXRpYWxTdGF0ZSIsInJlZHVjZXJzIiwic3RhdGUiLCJhY3Rpb25zIiwiYWRkUmVkdWNlciIsImZuIiwiQXJyYXkiLCJpc0FycmF5IiwiY29uY2F0IiwiZmlsdGVyIiwiZiIsIm5ld1N0YXRlIiwiY2FsbGJhY2siLCJkb0NhbGxiYWNrIiwiYWN0aW9uIiwidXBkYXRlZFN0YXRlIiwiZm9yRWFjaCIsInIiLCJzZXRTdGF0ZSIsInB1c2giLCJjYWxsYmFja0FyZ3MiLCJhcmdzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztJQUFNQSxpQjs7O0FBQ0osK0JBQXlDO0FBQUEsUUFBN0JDLFlBQTZCLHVFQUFkLEVBQWM7QUFBQSxRQUFWQyxRQUFVOztBQUFBOztBQUN2QyxTQUFLQyxLQUFMLHFCQUFrQkYsWUFBbEI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBS0UsT0FBTCxHQUFlLEVBQWY7QUFDQSxTQUFLQyxVQUFMLENBQWdCSCxRQUFoQjtBQUNEOzs7OytCQUNVSSxFLEVBQUk7QUFDYixVQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTixDQUFjRixFQUFkLENBQUwsRUFBd0JBLEVBQUUsR0FBRyxDQUFDQSxFQUFELENBQUw7QUFFeEIsV0FBS0osUUFBTCxHQUFnQixLQUFLQSxRQUFMLENBQ2JPLE1BRGEsQ0FDTkgsRUFETSxFQUViSSxNQUZhLENBRU4sVUFBQUMsQ0FBQztBQUFBLGVBQUksT0FBT0EsQ0FBUCxLQUFhLFVBQWpCO0FBQUEsT0FGSyxDQUFoQjtBQUdEOzs7NkJBQ1FDLFEsRUFBVUMsUSxFQUFVO0FBQzNCLFVBQUksT0FBT0QsUUFBUCxLQUFvQixVQUF4QixFQUFvQztBQUNsQ0EsUUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUMsS0FBS1QsS0FBTixDQUFuQjtBQUNEOztBQUNELFdBQUtBLEtBQUwscUJBQ0ssS0FBS0EsS0FEVixFQUVLUyxRQUZMO0FBS0EsV0FBS0UsVUFBTCxDQUFnQkQsUUFBaEI7QUFDRDs7OzZCQUNRRSxNLEVBQVFGLFEsRUFBMkI7QUFBQTs7QUFDMUMsVUFBSUcsWUFBWSxHQUFHLEtBQUtiLEtBQXhCO0FBQ0EsV0FBS0QsUUFBTCxDQUFjZSxPQUFkLENBQXNCLFVBQUFDLENBQUMsRUFBSTtBQUN6QixRQUFBLEtBQUksQ0FBQ0MsUUFBTCxDQUFjRCxDQUFDLENBQUNGLFlBQUQsRUFBZUQsTUFBZixDQUFmO0FBQ0QsT0FGRDtBQUdBLFdBQUtYLE9BQUwsQ0FBYWdCLElBQWIsQ0FBa0JMLE1BQWxCOztBQUwwQyx3Q0FBZE0sWUFBYztBQUFkQSxRQUFBQSxZQUFjO0FBQUE7O0FBTzFDLFdBQUtQLFVBQUwsY0FBZ0JELFFBQWhCLFNBQTZCUSxZQUE3QjtBQUNEOzs7K0JBQ1VSLFEsRUFBbUI7QUFBQSx5Q0FBTlMsSUFBTTtBQUFOQSxRQUFBQSxJQUFNO0FBQUE7O0FBQzVCLFVBQUksT0FBT1QsUUFBUCxLQUFvQixVQUF4QixFQUFvQ0EsUUFBUSxNQUFSLFNBQVlTLElBQVo7QUFDckM7Ozs7OztlQUdZdEIsaUIiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdGF0ZWZ1bENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKGluaXRpYWxTdGF0ZSA9IHt9LCByZWR1Y2Vycykge1xuICAgIHRoaXMuc3RhdGUgPSB7IC4uLmluaXRpYWxTdGF0ZSB9O1xuICAgIHRoaXMucmVkdWNlcnMgPSBbXTtcbiAgICB0aGlzLmFjdGlvbnMgPSBbXTtcbiAgICB0aGlzLmFkZFJlZHVjZXIocmVkdWNlcnMpO1xuICB9XG4gIGFkZFJlZHVjZXIoZm4pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZm4pKSBmbiA9IFtmbl07XG5cbiAgICB0aGlzLnJlZHVjZXJzID0gdGhpcy5yZWR1Y2Vyc1xuICAgICAgLmNvbmNhdChmbilcbiAgICAgIC5maWx0ZXIoZiA9PiB0eXBlb2YgZiA9PT0gXCJmdW5jdGlvblwiKTtcbiAgfVxuICBzZXRTdGF0ZShuZXdTdGF0ZSwgY2FsbGJhY2spIHtcbiAgICBpZiAodHlwZW9mIG5ld1N0YXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIG5ld1N0YXRlID0gbmV3U3RhdGUodGhpcy5zdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgLi4ubmV3U3RhdGVcbiAgICB9O1xuXG4gICAgdGhpcy5kb0NhbGxiYWNrKGNhbGxiYWNrKTtcbiAgfVxuICBkb0FjdGlvbihhY3Rpb24sIGNhbGxiYWNrLCAuLi5jYWxsYmFja0FyZ3MpIHtcbiAgICBsZXQgdXBkYXRlZFN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLnJlZHVjZXJzLmZvckVhY2gociA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHIodXBkYXRlZFN0YXRlLCBhY3Rpb24pKTtcbiAgICB9KTtcbiAgICB0aGlzLmFjdGlvbnMucHVzaChhY3Rpb24pO1xuXG4gICAgdGhpcy5kb0NhbGxiYWNrKGNhbGxiYWNrLCAuLi5jYWxsYmFja0FyZ3MpO1xuICB9XG4gIGRvQ2FsbGJhY2soY2FsbGJhY2ssIC4uLmFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRlZnVsQ29tcG9uZW50O1xuIl19