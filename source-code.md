# PXT source code exploration

## Simulation

Project folder is `/sim`.

Simulation is hosted on `/sim/simulator.html`, displayed in MakeCode Editor as
`iframe`.

Project is compiled using `tsc`.

Goal: How the board is constructed in the simulator?

- `<someScript>` calls `pxsim.Embed.run()`, defined in `pxt:pxtsim/embed.ts`,
  which calls `new Runtime()`.
- `Runtime` constructor, defined in `pxt:pxtsim/runtime.ts`, then calls
  `pxsim.initCurrentRuntime()` function variable.
- Source `sim/dalboard.ts` sets `pxsim.initCurrentRuntime` to
  `initRuntimeWithDalBoard`, defined in the same file.
- `initRuntimeWithDalBoard` constructs new `pxsim.DalBoard`, defined in the same
  file, to `pxsim.runtime.board`.
- `pxsim.Embed.run()` then calls `pxsim.runtime.board.initAsync()`, defined in
  `sim/dalboard.ts`.
- `DalBoard::initAsync()` calls `pxsim.visuals.mkBoardView()`, overridden in
  `sim/visuals/boardview.ts`, which constructs new `pxsim.visuals.MetroBoardSvg`
  object into `pxsim.runtime.board.viewHost.boardView`.
- Class `pxsim.visuals.MetroBoardSvg` is defined in `sim/visuals/board.ts`. Its
  constructor calls `super()`, which is `GenericBoardSvg`'s constructor, defined
  in `pxt:pxtsim/visuals/genericboard.ts`.
- `GenericBoardSvg` constructor calls `mkImageSVG()` to place board SVG into the
  simulator iframe. It then calls `mkPinBlockGrid()` on each array element of
  `visDef.pinBlocks`.
  - `visDef` comes from `props.visualDef`.
  - `props` is defined in `mkBoardView()`, and its `.visualDef` comes from
    `opts.visual`.
  - `opts` is defined when calling the function in `DalBoard::initAsync()`, and
    its `.visual` comes from `boardDef.visual`.
  - ...

When adding `mixer---samd` library, the simulator initially errors out as it
cannot find pin `A0`. This arrangement comes from `pxtparts.json`, provided in
`pxt-common-packages:music` library. This error is then traced in the source
code to find which variable is used when creating wiring diagram.

Goal: Which variable is used to find the pins?

- Call stack is: `initAsync` -> `t.BoardHost` -> `addAll` -> (...) -> (...) ->
  `checkWire` -> `getLocCoord` -> `getPinCoord`
- `addAll()` is called in `pxsim.visuals.BoardHost` constructor, at file
  `pxtsim/visuals/boardhost.ts` line 100.
- `addAll()` calls `this.wireFactory.checkWire()` in a two-fold iteration.
  `checkWire` calls `getLocCoord()`, which is a function pointer initialized in
  `WireFactory`'s constructor.
- `this.wireFactory` is constructed in `BoardHost` constructor, which binds
  `this.wireFactory.getLocCoord` to `this.getLocCoord`.
- `BoardHost::getLocCoord()` calls `this.getPinCoord()`.
  `BoardHost::getPinCoord()` calls `this.boardView.getCoord()`.
- `this.boardView` comes from `mkBoardView()`, which constructs new
  `MetroBoardSvg`. `MetroBoardSvg` extends `GenericBoardSvg`.
- `GenericBoardSvg::getCoord()` calls `this.findPin()`.
- `GenericBoardSvg::findPin()` tries to map pin name to `pinNmToPin` table.
- `GenericBoardSvg::pinNmToPin` is constructed in `GenericBoardSvg`'s
  constructor, mapping column name of each element of `this.allPins` to the
  element itself.

New idea: Scale the board image so pin circle's diameter matches board pin
width. Done! Alligator clip becomes too small. Scaling adjusted to deliver
proportional size against headphone jack.

Goal: Replace SVG element for pin hovering to manually-written proper ones.

- Refer to the board construction bullet list above.
- Results of the `mkPinBlockGrid()` call is stored in local variable
  `pinBlocks`. Then, it is stored in `this.allPins`, which expands to
  `pxsim.runtime.board.viewHost.boardView.allPins`.
- `this.allPins` is an array of `GridPin`s. For each elements, SVG element for
  hover is stored in `.hoverEl`, and pin name is stored in `.col` and `.group`.
- At file `pxtsim/visuals/genericboard.ts` line 280, each pin SVG elements are
  added to displayed SVG element `this.g`.

Goal: When is LED matrix component constructed?

- It is when `pxsim.visuals.mkLedMatrixSvg()` is called, which is never called
  because the LEDs are constructed inline in
  `pxsim.visuals.MicrobitBoardSvg.buildDom()` method, which is called during
  `pxsim.visuals.MicrobitBoardSvg` construction.
- The LED matrix is updated by calling
  `pxsim.visuals.MicrobitBoardSvg.updateLEDMatrix()`, which is called by
  `pxsim.visuals.MicrobitBoardSvg.updateState()` method, which is added to
  `pxsim.visuals.MicrobitBoardSvg.board.updateSubscribers[]` array of functions.
