import { injectGlobal } from "@emotion/css"
import * as pinInput from "@ui-machines/pin-input"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { pinInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { pinInputControls } from "../../../../shared/controls"

injectGlobal(pinInputStyle)

export default defineComponent({
  name: "PinInput",
  setup() {
    const controls = useControls(pinInputControls)

    const [state, send] = useMachine(pinInput.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => pinInput.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <controls.ui />

          <div ref={ref} {...api.rootProps}>
            <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
          </div>

          <button data-testid="clear-button" onClick={api.clearValue}>
            Clear
          </button>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
