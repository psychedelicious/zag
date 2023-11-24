"use strict";

var _xstate = require("xstate");
const {
  actions,
  createMachine,
  assign
} = _xstate;
const {
  choose
} = actions;
const fetchMachine = createMachine({
  id: "dialog",
  initial: [{
    cond: "isOpen",
    target: "open"
  }, {
    target: "closed"
  }],
  context: {
    "isOpen": false,
    "isControlled && isOpen": false,
    "isControlled && !isOpen": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    open: {
      entry: ["checkRenderedElements"],
      exit: ["restoreFocus"],
      always: {
        cond: "isControlled && isOpen",
        actions: ["flushTransitionActions"]
      },
      activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
      on: {
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        TOGGLE: {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      }
    },
    closed: {
      always: {
        cond: "isControlled && !isOpen",
        actions: ["flushTransitionActions"]
      },
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        TOGGLE: {
          target: "open",
          actions: ["invokeOnOpen"]
        }
      }
    }
  }
}, {
  actions: {
    updateContext: assign((context, event) => {
      return {
        [event.contextKey]: true
      };
    })
  },
  guards: {
    "isOpen": ctx => ctx["isOpen"],
    "isControlled && isOpen": ctx => ctx["isControlled && isOpen"],
    "isControlled && !isOpen": ctx => ctx["isControlled && !isOpen"]
  }
});