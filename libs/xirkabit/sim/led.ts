// sim/led.ts
namespace pxsim.led {
    
    export function point(x: number, y: number): boolean {
        x |= 0
        y |= 0
        return pxsim.led.pointBrightness(x, y) > 0
    }
    export function flushBrightness(): void {
    }
}
