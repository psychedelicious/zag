import { expect, test, vi } from "vitest"
import { createMachine } from "../src"

test("always state", () => {
  let called = vi.fn()

  const machine = createMachine({
    initial: "a",
    context: { value: 4 },
    states: {
      a: {
        entry() {
          console.log("-------enter a")
        },
        exit() {
          console.log("-------exit a")
        },
        on: {
          INC: {
            actions(ctx) {
              ctx.value++
              console.log("------inc")
            },
          },
        },
        always: {
          guard(ctx) {
            return ctx.value > 4
          },
          target: "b",
          actions() {
            called()
            console.log("-------always a")
          },
        },
      },
      b: {
        always: {
          target: "c",
          actions() {
            console.log("--------always b")
          },
        },
        entry() {
          console.log("-------enter b")
        },
      },
      c: {
        entry() {
          console.log("----------enter c")
        },
      },
    },
  })

  machine.start()
  machine.send({ type: "INC" })

  expect(called).toHaveBeenCalled()
})

test("dialog state", () => {
  let called = vi.fn()

  const machine = createMachine({
    initial: "open",
    context: { open: true },
    states: {
      open: {
        always: {
          guard: (ctx, evt) => Boolean(ctx.open && evt.controlled),
          actions() {
            called()
            console.log("-------called------")
          },
        },
        on: {
          CLOSE: {
            target: "closed",
          },
        },
      },
      closed: {
        entry() {
          console.log("entered")
        },
      },
    },
  })

  machine.start()
  machine.send({ type: "CLOSE", controlled: true })
  machine.send({ type: "CLOSE", controlled: true })
  // machine.send({ type: "CLOSE", controlled: true })

  expect(called).toHaveBeenCalled()
})
