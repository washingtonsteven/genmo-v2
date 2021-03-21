import { ACTIONS, cloneData } from "../../utils/reducerUtils";

/**
 * If `action.type === ACTION.PROMPT_ANSWER.type`, this will take `action.key` and set it to `action.value`,
 * as well as updating the `needsPrompt` key in the passage to indicate that this prompt has been fulfilled.
 *
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export function promptAnswerReducer(state = {}, action) {
  if (action.type === ACTIONS.PROMPT_ANSWER.type) {
    const newState = {
      ...state,
      data: cloneData(state.data),
    };
    const targetPassage = newState.storyData.passages.find(
      (p) => p.pid === action.pid
    );

    targetPassage.needsPrompt = targetPassage.needsPrompt.map((prompt) => {
      if (prompt.key === action.key) {
        return { ...prompt, complete: true };
      }
      return prompt;
    });

    newState.currentPassage = targetPassage;

    newState.data = {
      ...newState.data,
      [action.key]: action.value,
    };

    return newState;
  }

  return {
    ...state,
  };
}
