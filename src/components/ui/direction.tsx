"use client"

import { Direction } from "radix-ui"
import type * as React from "react"

type DirectionValue = React.ComponentProps<
  typeof Direction.DirectionProvider
>["dir"]

type DirectionProviderProps =
  | (Omit<React.ComponentProps<typeof Direction.DirectionProvider>, "dir"> & {
      dir: DirectionValue
      direction?: DirectionValue
    })
  | (Omit<React.ComponentProps<typeof Direction.DirectionProvider>, "dir"> & {
      dir?: DirectionValue
      direction: DirectionValue
    })

function DirectionProvider({
  dir,
  direction,
  children,
}: DirectionProviderProps) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
