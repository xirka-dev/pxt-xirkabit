namespace pxsim {
    export namespace accel {

        // default simulator values
        let _x = 0;
        let _y = 0;
        let _z = 1023;

        export function x() {
            return _x;
        }

        export function y() {
            return _y;
        }

        export function z() {
            return _z;
        }

        export function strength() {
            return Math.sqrt(_x * _x + _y * _y + _z * _z) | 0;
        }

        // update used by simulator UI
        export function update(x: number, y: number, z: number) {
            _x = x;
            _y = y;
            _z = z;
        }
    }

    export namespace input {
        export function accelX() {
            return accel.x();
        }
        export function accelY() {
            return accel.y();
        }
        export function accelZ() {
            return accel.z();
        }
        export function accelStrength() {
            return accel.strength();
        }
    }
}
