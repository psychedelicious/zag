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
  id: "tooltip",
  initial: [{
    cond: "isOpen",
    target: "open"
  }, {
    target: "closed"
  }],
  context: {
    "isOpen": false,
    "isControlled && !isOpen": false,
    "noVisibleTooltip && !hasPointerMoveOpened": false,
    "!hasPointerMoveOpened": false,
    "closeOnPointerDown": false,
    "isControlled && isOpen": false,
    "isVisible": false,
    "isInteractive": false,
    "closeOnPointerDown": false,
    "isInteractive": false
  },
  on: {
    UPDATE_CONTEXT: {
      actions: "updateContext"
    }
  },
  states: {
    closed: {
      tags: ["closed"],
      always: {
        cond: "isControlled && !isOpen",
        actions: ["invokeOnOpen"]
      },
      entry: ["clearGlobalId"],
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        FOCUS: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        POINTER_LEAVE: {
          actions: ["clearPointerMoveOpened"]
        },
        POINTER_MOVE: [{
          cond: "noVisibleTooltip && !hasPointerMoveOpened",
          target: "opening"
        }, {
          cond: "!hasPointerMoveOpened",
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }]
      }
    },
    opening: {
      tags: ["closed"],
      activities: ["trackScroll", "trackPointerlockChange"],
      after: {
        OPEN_DELAY: {
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        }
      },
      on: {
        POINTER_LEAVE: {
          target: "closed",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        BLUR: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        SCROLL: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        POINTER_LOCK_CHANGE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        POINTER_DOWN: {
          cond: "closeOnPointerDown",
          target: "closed",
          actions: ["invokeOnClose"]
        }
      }
    },
    open: {
      tags: ["open"],
      entry: ["setGlobalId"],
      always: {
        cond: "isControlled && isOpen",
        actions: ["invokeOnClose"]
      },
      activities: ["trackEscapeKey", "trackDisabledTriggerOnSafari", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      on: {
        POINTER_LEAVE: [{
          cond: "isVisible",
          target: "closing",
          actions: ["clearPointerMoveOpened"]
        }, {
          target: "closed",
          actions: ["clearPointerMoveOpened", "invokeOnClose"]
        }],
        BLUR: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        ESCAPE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        SCROLL: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        POINTER_LOCK_CHANGE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        "CONTENT.POINTER_LEAVE": {
          cond: "isInteractive",
          target: "closing"
        },
        POINTER_DOWN: {
          cond: "closeOnPointerDown",
          target: "closed",
          actions: ["invokeOnClose"]
        },
        CLICK: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        SET_POSITIONING: {
          actions: "reposition"
        }
      }
    },
    closing: {
      tags: ["open"],
      activities: ["trackStore", "trackPositioning"],
      after: {
        CLOSE_DELAY: {
          target: "closed",
          actions: ["invokeOnClose"]
        }
      },
      on: {
        OPEN: {
          target: "open",
          actions: ["invokeOnOpen"]
        },
        CLOSE: {
          target: "closed",
          actions: ["invokeOnClose"]
        },
        POINTER_MOVE: {
          target: "open",
          actions: ["setPointerMoveOpened", "invokeOnOpen"]
        },
        "CONTENT.POINTER_MOVE": {
          cond: "isInteractive",
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
  delays: {
    OPEN_DELAY: 1000,
    CLOSE_DELAY: 500
  },
  guards: {
    "isOpen": ctx => ctx["isOpen"],
    "isControlled && !isOpen": ctx => ctx["isControlled && !isOpen"],
    "noVisibleTooltip && !hasPointerMoveOpened": ctx => ctx["noVisibleTooltip && !hasPointerMoveOpened"],
    "!hasPointerMoveOpened": ctx => ctx["!hasPointerMoveOpened"],
    "closeOnPointerDown": ctx => ctx["closeOnPointerDown"],
    "isControlled && isOpen": ctx => ctx["isControlled && isOpen"],
    "isVisible": ctx => ctx["isVisible"],
    "isInteractive": ctx => ctx["isInteractive"]
  }
});