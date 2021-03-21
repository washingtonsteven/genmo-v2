import StatefulComponent from "../../src/state/statefulComponent";

const initialState = {
  a: true,
  b: "string(b)",
  c: 3,
};

const createReducers = () => [jest.fn()];

describe("StatefulComponent", () => {
  let reducers;
  beforeEach(() => {
    reducers = createReducers();
  });

  test("Create", () => {
    expect(() => new StatefulComponent()).not.toThrow();

    const component = new StatefulComponent(initialState, reducers);
    expect(component.state).toStrictEqual(initialState);
    expect(component.reducers).toStrictEqual(reducers);
  });

  test("addReducer", () => {
    const component = new StatefulComponent(initialState, reducers);

    // Add single fn
    component.addReducer(jest.fn());
    expect(component.reducers.length).toEqual(2);

    // Add Multiple
    component.addReducer([jest.fn(), jest.fn()]);
    expect(component.reducers.length).toEqual(4);

    component.reducers.forEach((r) => expect(r).toEqual(expect.any(Function)));
  });

  test("setState", () => {
    const component = new StatefulComponent(initialState, reducers);
    const callback = jest.fn();
    const newState = { notInitialState: true };

    component.setState(newState, callback);

    expect(component.state).toStrictEqual({ ...initialState, ...newState });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("doAction", () => {
    const newState = { updatedState: true };
    const action = { type: "TEST_ACTION" };
    reducers.push(
      jest.fn().mockImplementation(() => {
        return newState;
      })
    );
    const component = new StatefulComponent(initialState, reducers);

    component.doAction(action);

    expect(reducers[0]).toHaveBeenCalledTimes(1);
    expect(reducers[1]).toHaveBeenCalledWith(initialState, action);
    expect(component.state).toStrictEqual(expect.objectContaining(newState));
    expect(component.actions.length).toEqual(1);
    expect(component.previousStates.length).toEqual(1);
    expect(component.snapshots.length).toEqual(1);
    expect(component.snapshots[0]).toStrictEqual(
      expect.objectContaining({
        beforeState: {
          ...initialState,
        },
        afterState: {
          ...initialState,
          ...newState,
        },
        action,
      })
    );
  });

  test("getMostRecentSnapshotWithActionType", () => {
    const action1 = { type: "TEST_ACTION_1" };
    const action2 = { type: "TEST_ACTION_2" };
    reducers.push(
      jest.fn().mockImplementation((state, action) => {
        return {
          ...state,
          c: action.type === action1.type ? state.c + 1 : state.c * 2,
        };
      })
    );

    const component = new StatefulComponent(initialState, reducers);

    component.doAction(action1); // 4
    component.doAction(action2); // 8
    component.doAction(action1); // 9
    component.doAction(action1); // 10
    component.doAction(action1); // 11

    const snapshot = component.getMostRecentSnapshotWithActionType(
      action2.type
    );

    expect(snapshot).not.toBeNull();
    expect(snapshot.beforeState.c).toEqual(4);
    expect(snapshot.afterState.c).toEqual(8);
    expect(component.state.c).toEqual(11);
  });
});
