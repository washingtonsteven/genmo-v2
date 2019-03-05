class StatefulComponent {
  constructor(initialState = {}, reducers) {
    this.state = { ...initialState };
    this.reducers = [];
    this.actions = [];
    this.addReducer(reducers);
  }
  addReducer(fn) {
    if (!Array.isArray(fn)) fn = [fn];

    this.reducers = this.reducers
      .concat(fn)
      .filter(f => typeof f === "function");
  }
  setState(newState, callback) {
    if (typeof newState === "function") {
      newState = newState(this.state);
    }
    this.state = {
      ...this.state,
      ...newState
    };

    this.doCallback(callback);
  }
  doAction(action, callback, ...callbackArgs) {
    let updatedState = this.state;
    this.reducers.forEach(r => {
      this.setState(r(updatedState, action));
    });
    this.actions.push(action);

    this.doCallback(callback, ...callbackArgs);
  }
  doCallback(callback, ...args) {
    if (typeof callback === "function") callback(...args);
  }
}

export default StatefulComponent;
