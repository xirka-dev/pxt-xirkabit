namespace pxsim.visuals {
    const svg = pxsim.svg;

    export const VIEW_WIDTH = 372.3404255319149;
    export const VIEW_HEIGHT = 361.70212765957444;
    const TOP_MARGIN = 20;
    const MID_MARGIN = 40;
    const BOT_MARGIN = 20;
    const PIN_LBL_SIZE = PIN_DIST * 0.7;
    const PIN_LBL_HOVER_SIZE = PIN_LBL_SIZE * 1.5;
    const SQUARE_PIN_WIDTH = PIN_DIST * 0.66666;
    const SQUARE_PIN_HOVER_WIDTH = PIN_DIST * 0.66666 + PIN_DIST / 3.0;

    const STYLE = `
.sim-board-pin {
    stroke: none;
    fill: none;
}
.sim-board-pin-hover {
    stroke:rgb(255, 222, 114);
    stroke-width: 2px;
    fill: none;
}

.sim-board-button {
    stroke: #aaa;
    stroke-width: 3px;
    fill: #666;
}
.sim-board-button.pressed {
    fill: #ee0;
}
.sim-board-button:hover {
    stroke-width: 4px;
    stroke: #ee0;
    cursor: pointer;
}

.sim-led-back:hover {
    stroke:#a0a0a0;
    stroke-width:3px;
}
.sim-led {
    fill:rgb(200, 0, 0);
}
.sim-led:hover {
    stroke:#ff7f7f;
    stroke-width:3px;
}
    `

    export interface IBoardTheme {
        accent?: string;
        display?: string;
        pin?: string;
        pinTouched?: string;
        pinActive?: string;
        ledOn?: string;
        ledOff?: string;
        buttonOuter?: string;
        buttonUps: string[];
        buttonDown?: string;
        virtualButtonOuter?: string;
        virtualButtonUp?: string;
        virtualButtonDown?: string;
        lightLevelOn?: string;
        lightLevelOff?: string;
        soundLevelOn?: string;
        soundLevelOff?: string;
    }

    export var themes: IBoardTheme[] = ["#3ADCFE"].map(accent => {
        return {
            accent: accent,
            pin: "#D4AF37",
            pinTouched: "#FFA500",
            pinActive: "#FF5500",
            ledOn: "#ff7777",
            ledOff: "#fff",
            buttonOuter: "#979797",
            buttonUps: ["#000", "#000", "#000"],
            buttonDown: "#FFA500",
            virtualButtonDown: "#FFA500",
            virtualButtonOuter: "#333",
            virtualButtonUp: "#fff",
            lightLevelOn: "yellow",
            lightLevelOff: "#555",
            soundLevelOn: "#7f8c8d",
            soundLevelOff: "#555",
        }
    });

    export function randomTheme(): IBoardTheme {
        return themes[Math.floor(Math.random() * themes.length)];
    }

    export type ComputedBoardDimensions = {
        scaleFn: (n: number) => number,
        height: number,
        width: number,
        xOff: number,
        yOff: number
    };

    export function getBoardDimensions(vis: BoardImageDefinition): ComputedBoardDimensions {
        let scaleFn = (n: number) => n * (PIN_DIST / vis.pinDist);
        let width = scaleFn(vis.width);
        return {
            scaleFn: scaleFn,
            height: scaleFn(vis.height),
            width: width,
            xOff: (VIEW_WIDTH - width) / 2.0,
            yOff: TOP_MARGIN
        }
    }

    export interface MetroBoardProps extends GenericBoardProps {
        runtime?: pxsim.Runtime;
        theme?: IBoardTheme;
        disableTilt?: boolean;
    }

    export interface LedMatrixSvg {
        el: SVGGElement,
        y: number,
        x: number,
        w: number,
        h: number,
        leds: SVGElement[],
        ledsOuter: SVGElement[]
    };

    export class MetroBoardSvg extends GenericBoardSvg {

        public board: pxsim.DalBoard;
        private onBoardLeds: BoardLed[];
        private onBoardNeopixels: BoardNeopixel[];
        private onBoardReset: BoardResetButton;
        private onBoardButtons: BoardButton[];
        private onBoardTouchPads: BoardTouchButton[];
        private onBoardLedMatrix: LedMatrixSvg;

        constructor(public props: MetroBoardProps) {
            super(props);

            const el = this.getView().el;
            this.addDefs(el);

            // Create SVG element for pin hover effect
            const boardEl = el.getElementsByTagName("g");
            while(boardEl.length > 0){
                const boardG = boardEl[0];
                const boardPinHovers = <HTMLCollectionOf<SVGElement>>boardG.getElementsByClassName("sim-board-pin-hover");
                if(boardPinHovers.length == 0) break;

                const pinMap = new Map();
                pinMap.set("P0", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "M 76.380859,251.05469 V 210 a 13.5,13.5 0 0 0 -13.5,-13.5 13.5,13.5 0 0 0 -13.5,13.5 v 39.98047 a 17.115,17.115 0 0 0 6,1.07422 z"
                }));
                pinMap.set("P1", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "m 120.63086,196.5 a 13.5,13.5 0 0 0 -13.5,13.5 v 41.05469 h 27 V 210 a 13.5,13.5 0 0 0 -13.5,-13.5 z"
                }));
                pinMap.set("P2", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "m 185.88,196.49997 a 13.5,13.5 0 0 0 -13.5,13.5 v 41.05517 h 27 v -41.05517 a 13.5,13.5 0 0 0 -13.5,-13.5 z"
                }));
                pinMap.set("P3", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "M 48.630859,249.68164 V 214.5 H 38.234375 V 234 a 17.115,17.115 0 0 0 10.396484,15.68164 z"
                }));
                for(let i=0; i<4; i=i+1){
                    pinMap.set(
                        "P" + String(i+4),
                        svg.elt("rect", {
                            class: "sim-board-pin-hover",
                            x: (77.13+i*7.5),
                            y: 214.5,
                            width: 6.75,
                            height: 36.555
                        })
                    );
                }
                for(let i=0; i<5; i=i+1){
                    pinMap.set(
                        "P" + String(i+8),
                        svg.elt("rect", {
                            class: "sim-board-pin-hover",
                            x: (134.88+i*7.5),
                            y: 214.5,
                            width: 6.75,
                            height: 36.555
                        })
                    );
                }
                for(let i=0; i<5; i=i+1){
                    let xi = 200.13+i*7.5;
                    if(i>3) xi -= 0.75;
                    let wi = (i==2) ? 6.00 : 6.75;
                    let keyi = (i==4) ? "3V31" :
                        ("P" + String(i+13));
                    pinMap.set(
                        keyi,
                        svg.elt("rect", {
                            class: "sim-board-pin-hover",
                            x: xi,
                            y: 214.5,
                            width: wi,
                            height: 36.555
                        })
                    );
                }
                pinMap.set("3V3", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    transform: "translate(64.5)",
                    d: "m 185.88,196.49997 a 13.5,13.5 0 0 0 -13.5,13.5 v 41.05517 h 27 v -41.05517 a 13.5,13.5 0 0 0 -13.5,-13.5 z"
                }));
                for(let i=0; i<4; i+=1){
                    let xi = 264.63+i*7.5;
                    if(i>2) xi += 0.75;
                    let wi = (i==2) ? 7.5 : 6.75;
                    let keyi = (i==0) ? "3V32" :
                        (i==3) ? "GND1" :
                        ("P" + String(i+18));
                    pinMap.set(
                        keyi,
                        svg.elt("rect", {
                            class: "sim-board-pin-hover",
                            x: xi,
                            y: 214.5,
                            width: wi,
                            height: 36.555
                        })
                    );
                }
                pinMap.set("GND", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "m 308.88,196.49997 a 13.5,13.5 0 0 0 -13.5,13.5 v 4.5 7.5 29.05517 h 21.49512 a 17.115,17.115 0 0 0 5.50488,-0.90966 v -28.14551 -7.5 -4.5 a 13.5,13.5 0 0 0 -13.5,-13.5 z"
                }));
                pinMap.set("GND2", svg.elt("path", {
                    class: "sim-board-pin-hover",
                    d: "m 323.13,249.87155 a 17.115,17.115 0 0 0 10.86035,-15.87158 v -19.5 H 323.13 Z"
                }));
                
                // Replace pin hover element
                for(const h of boardPinHovers){
                    if(h.childElementCount < 1) continue;
                    const tag = <SVGTitleElement>h.children[0];
                    if(!tag) continue;
                    const pinTitle = tag.textContent;
                    if(!pinMap.has(pinTitle)) continue;
                    const newH = pinMap.get(pinTitle);
                    svg.title(newH, pinTitle);
                    h.replaceWith(newH);
                }

                // Move the invisible pin label above the pin element
                const transformMove = el.createSVGTransform();
                transformMove.setTranslate(36, 0);

                let pinLabels = Array.from(<HTMLCollectionOf<SVGGraphicsElement>>boardG.getElementsByClassName("sim-board-pin-lbl"));
                pinLabels = pinLabels.concat(Array.from(<HTMLCollectionOf<SVGGraphicsElement>>boardG.getElementsByClassName("sim-board-pin-lbl-hover")));
                for(const l of pinLabels){
                    l.transform.baseVal.appendItem(transformMove);
                }
                break;
            }


            this.onBoardLeds = []
            this.onBoardNeopixels = [];
            this.onBoardTouchPads = [];
            this.onBoardButtons = [];

            // neopixels/leds
            for (const l of props.visualDef.leds || []) {
                if (l.color == "neopixel") {
                    const onBoardNeopixel = new BoardNeopixel(l.label, l.x, l.y, l.w || 0);
                    this.onBoardNeopixels.push(onBoardNeopixel);
                    el.appendChild(onBoardNeopixel.element);
                } else {
                    const pin = pinByName(l.label);
                    if (pin) {
                        let bl = new BoardLed(l.x, l.y, l.color, pinByName(l.label),
                            l.w || 9, l.h || 8)
                        this.onBoardLeds.push(bl)
                        el.appendChild(bl.element)
                    }
                }
            }
            this.onBoardNeopixels.sort((l, r) => {
                const li = parseInt(l.name.replace(/^[^\d]*/, '')) || 0;
                const ri = parseInt(r.name.replace(/^[^\d]*/, '')) || 0;
                return li < ri ? -1 : li > ri ? 1 : 0;
            })

            // reset button
            if (props.visualDef.reset) {
                this.onBoardReset = new BoardResetButton(props.visualDef.reset)
                el.appendChild(this.onBoardReset.element)
            }

            // touch pads
            for (const l of props.visualDef.touchPads || []) {
                const pin = pxsim.pinIds[l.label];
                if (!pin) {
                    console.error(`touch pin ${pin} not found`)
                    continue;
                }
                const tp = new BoardTouchButton(l, pin);
                this.onBoardTouchPads.push(tp);
                el.appendChild(tp.element);
            }

            // regular buttons
            for (const l of props.visualDef.buttons || []) {
                const tp = new BoardButton(l);
                this.onBoardButtons.push(tp);
                el.appendChild(tp.element);
            }

            if (props && props.runtime)
                this.board = this.props.runtime.board as pxsim.DalBoard;

            // LED matrix
            if(this.board.builtinPartVisuals["ledmatrix"]){
                this.onBoardLedMatrix = <LedMatrixSvg>this.board.builtinPartVisuals["ledmatrix"]([135.810, 78.015]);
                el.appendChild(this.onBoardLedMatrix.el);
            }

            if (props && props.theme)
                this.updateTheme();

            if (props && props.runtime) {
                this.board.updateSubscribers.push(() => this.updateState());
                this.updateState();
            }


        }

        public updateTheme() {
        }

        public updateState() {
            this.onBoardLeds.forEach(l => l.updateState());
            if (this.board.neopixelPin) {
                const state = this.board.neopixelState(this.board.neopixelPin.id);
                if (state.buffer) {
                    for (let i = 0; i < this.onBoardNeopixels.length; ++i) {
                        const rgb = state.pixelColor(i)
                        if (rgb !== null)
                            this.onBoardNeopixels[i].setColor(rgb as any);
                    }
                }
            }

            this.updateLEDMatrix();
        }

        private addDefs(el: SVGElement) {
            const defs = svg.child(el, "defs", {});

            let neopixelglow = svg.child(defs, "filter", { id: "neopixelglow", x: "-200%", y: "-200%", width: "400%", height: "400%" });
            svg.child(neopixelglow, "feGaussianBlur", { stdDeviation: "4.3", result: "coloredBlur" });
            let neopixelmerge = svg.child(neopixelglow, "feMerge", {});
            svg.child(neopixelmerge, "feMergeNode", { in: "coloredBlur" })
            svg.child(neopixelmerge, "feMergeNode", { in: "SourceGraphic" })

            let ledglow = svg.child(defs, "filter", { id: "ledglow", x: "-75%", y: "-75%", width: "300%", height: "300%" });
            svg.child(ledglow, "feMorphology", { operator: "dilate", radius: "4", in: "SourceAlpha", result: "thicken" });
            svg.child(ledglow, "feGaussianBlur", { stdDeviation: "5", in: "thicken", result: "blurred" });
            svg.child(ledglow, "feFlood", { "flood-color": "rgb(255, 17, 77)", result: "glowColor" });
            svg.child(ledglow, "feComposite", { in: "glowColor", in2: "blurred", operator: "in", result: "ledglow_colored" });
            let ledglowMerge = svg.child(ledglow, "feMerge", {});
            svg.child(ledglowMerge, "feMergeNode", { in: "ledglow_colored" });
            svg.child(ledglowMerge, "feMergeNode", { in: "SourceGraphic" });

            const style = svg.child(el, "style", {});
            style.textContent = STYLE;
        }

        private updateLEDMatrix() {
            const state = this.board;
            if (state.ledMatrixState.disabled) {
                this.onBoardLedMatrix.leds.forEach((led, i) => {
                    const sel = (<SVGStyleElement><any>led)
                    sel.style.opacity = "0";
                })
            } else {
                const bw = state.ledMatrixState.displayMode == pxsim.DisplayMode.bw
                const img = state.ledMatrixState.image;
                const br = state.ledMatrixState.brigthness != undefined ? state.ledMatrixState.brigthness : 255;
                this.onBoardLedMatrix.leds.forEach((led, i) => {
                    const sel = (<SVGStyleElement><any>led)
                    let imgbr = bw ? (img.data[i] > 0 ? br : 0) : img.data[i];
                    // correct brightness
                    const opacity = imgbr > 0 ? imgbr / 255 * 155 + 100 : 0;
                    const transfrom = imgbr > 0 ? imgbr / 255 * 0.4 + 0.6 : 0;
                    sel.style.opacity = (opacity / 255) + "";
                    if (transfrom > 0) {
                        (sel.style as any).transformBox = 'fill-box';
                        sel.style.transformOrigin = '50% 50%';
                        sel.style.transform = `scale(${transfrom})`;
                    }
                })
            }
        }
    }

    class BoardResetButton {
        element: SVGElement;
        constructor(p: BoxDefinition) {
            p.w = p.w || 15;
            p.h = p.h || 15;
            this.element = svg.elt("circle", {
                cx: p.x + p.w / 2,
                cy: p.y + p.h / 2,
                r: Math.max(p.w, p.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, "RESET");
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                pxsim.U.addClass(this.element, "pressed");
                pxsim.Runtime.postMessage(<pxsim.SimulatorCommandMessage>{
                    type: "simulator",
                    command: "restart"
                })
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
            })
        }
    }

    class BoardLed {
        private colorOff = "#aaa"
        private backElement: SVGElement;
        private ledElement: SVGElement;
        element: SVGElement;

        constructor(x: number, y: number, private colorOn: string, private pin: Pin, w: number, h: number) {
            this.backElement = svg.elt("rect", { x, y, width: w, height: h, fill: this.colorOff });
            this.ledElement = svg.elt("rect", { x, y, width: w, height: h, fill: this.colorOn, opacity: 0 });
            svg.filter(this.ledElement, `url(#neopixelglow)`);
            this.element = svg.elt("g", { class: "sim-led" });
            this.element.appendChild(this.backElement);
            this.element.appendChild(this.ledElement);
        }

        updateTheme(colorOff: string, colorOn: string) {
            if (colorOff) {
                this.colorOff = colorOff;
            }
            if (colorOn) {
                this.colorOn = colorOn;
            }
        }

        updateState() {
            const opacity = this.pin.mode & PinFlags.Digital ? (this.pin.value > 0 ? 1 : 0)
                : 0.1 + Math.max(0, Math.min(1023, this.pin.value)) / 1023 * 0.8;
            this.ledElement.setAttribute("opacity", opacity.toString())
        }
    }

    class BoardNeopixel {
        name: string;
        element: SVGCircleElement;

        constructor(name: string, x: number, y: number, r: number) {
            this.name = name;
            this.element = svg.elt("circle", { cx: x + r / 2, cy: y + r / 2, r: 10 }) as SVGCircleElement
            svg.title(this.element, name);
        }

        setColor(rgb: [number, number, number]) {
            const hsl = visuals.rgbToHsl(rgb);
            let [h, s, l] = hsl;
            const lx = Math.max(l * 1.3, 85);

            // at least 10% luminosity
            l = l * 90 / 100 + 10;
            this.element.style.stroke = `hsl(${h}, ${s}%, ${Math.min(l * 3, 75)}%)`
            this.element.style.strokeWidth = "1.5";
            svg.fill(this.element, `hsl(${h}, ${s}%, ${lx}%)`);
            svg.filter(this.element, `url(#neopixelglow)`);
        }
    }

    class BoardButton {
        element: SVGElement;
        def: ButtonDefinition;
        button: CommonButton;
        constructor(def: ButtonDefinition) {
            this.def = def;
            def.w = def.w || 15;
            def.h = def.h || 15;
            this.element = svg.elt("circle", {
                cx: def.x + def.w / 2,
                cy: def.y + def.h / 2,
                r: Math.max(def.w, def.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, def.label);
            // resolve button
            this.button = def.index !== undefined
                ? pxsim.pxtcore.getButton(def.index)
                : pxsim.pxtcore.getButtonByPin(pxsim.pinIds[def.label]);
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                this.button.setPressed(true);
                pxsim.U.addClass(this.element, "pressed");
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
        }
    }

    class BoardTouchButton {
        element: SVGElement;
        def: TouchPadDefinition;
        button: TouchButton;
        constructor(def: TouchPadDefinition, pinId: number) {
            this.def = def;
            def.w = def.w || 15;
            def.h = def.h || 15;
            this.element = svg.elt("circle", {
                cx: def.x + def.w / 2,
                cy: def.y + def.h / 2,
                r: Math.max(def.w, def.h) / 2,
                class: "sim-board-button"
            }) as SVGCircleElement
            svg.title(this.element, def.label);
            // resolve button
            this.button = pxsim.pxtcore.getTouchButton(pinId);
            // hooking up events
            pointerEvents.down.forEach(evid => this.element.addEventListener(evid, ev => {
                this.button.setPressed(true);
                pxsim.U.addClass(this.element, "pressed");
            }));
            this.element.addEventListener(pointerEvents.leave, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
            this.element.addEventListener(pointerEvents.up, ev => {
                pxsim.U.removeClass(this.element, "pressed");
                this.button.setPressed(false);
            })
        }
    }

    export function mkLedMatrixSvg(xy: Coord): LedMatrixSvg {
        let result: LedMatrixSvg = {
            el: <SVGGElement>svg.elt("g"),
            x: xy[0],
            y: xy[1],
            w: 22.635,
            h: 23.145,
            leds: [],
            ledsOuter: []
        };
        const left = result.x, top = result.y, ledoffw = result.w, ledoffh = result.h;

        for (let i = 0; i < 5; ++i) {
            let ledtop = i * ledoffh + top;
            for (let j = 0; j < 5; ++j) {
                let ledleft = j * ledoffw + left;
                let k = i * 5 + j;
                result.ledsOuter.push(svg.child(result.el, "rect", { class: "sim-led-back", x: ledleft, y: ledtop, width: 10.065, height: 14.085, rx: 2, ry: 2 }));
                let led = svg.child(result.el, "rect", { class: "sim-led", x: ledleft - 2, y: ledtop - 2, width: 14.065, height: 18.085, rx: 3, ry: 3, title: `(${j},${i})` });
                svg.filter(led, `url(#ledglow)`)
                result.leds.push(led);
            }
        }

        return result;
    }
}