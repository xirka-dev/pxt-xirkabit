// libs/core---samd/bluetooth.ts

//% color="#0075b5" weight=100 icon="\uf294"
//% block="Bluetooth"
namespace xirkabt {
    let _device: serial.Serial;
    
    // The Buffer (Mailbox)
    let _msgBuffer: string[] = [];

    export function device(): serial.Serial {
        if (!_device) {
            const tx = pins.pinByCfg(DAL.CFG_PIN_B22);
            const rx = pins.pinByCfg(DAL.CFG_PIN_B23);
            if (!tx || !rx) return undefined;
            _device = serial.createSerial(tx, rx, 34);
        }
        return _device;
    }

    /**
     * Start the XirkaBit Bluetooth service.
     * With Status Emotes: Ready (✓), Connected (:)), Disconnected (:()
     */
    //% block="Bluetooth UART Service"
    export function startXirkaBluetooth(): void {
        // --- Hardware Init ---
        serial.writeString('{"CMD":"BTRST","DATA":"1"}');        
        serial.writeString('{"CMD":"BTPWRC","DATA":"0"}');
        device().serialDevice.setBaudRate(BaudRate.BaudRate4800);

        // --- Background Listener ---
        control.runInParallel(function() {
            let lastChar = "";
            let lastTime = 0;

            while(true) {
                // Read RAW string
                let rawChunk = device().readString();

                if (rawChunk.length > 0) {
                    // --- 1. SYSTEM MESSAGE CHECK (The Gatekeeper) ---
                    // We check the whole chunk for keywords before splitting characters
                    
                    if (rawChunk.includes("+CONNECTED")) {
                        basic.showIcon(IconNames.Happy);
                        // Stop here. Do not save to buffer.
                        rawChunk = ""; 
                    }
                    else if (rawChunk.includes("+DISCONNECTED")) {
                        basic.showIcon(IconNames.Sad);
                        rawChunk = "";
                    }
                    else if (rawChunk.includes("+READY")) {
                        basic.showIcon(IconNames.Yes);
                        rawChunk = "";
                    }

                    // --- 2. DATA PROCESSING ---
                    // Only proceed if rawChunk wasn't cleared by the Gatekeeper above
                    if (rawChunk.length > 0) {
                        for (let i = 0; i < rawChunk.length; i++) {
                            let singleChar = rawChunk.charAt(i);
                            let now = input.runningTime();

                            // Duplicate Blocker
                            if (singleChar == lastChar && (now - lastTime) < 300) {
                                // Ignore duplicate
                            } else {
                                lastChar = singleChar;
                                lastTime = now;
                                _msgBuffer.push(singleChar); // Save to buffer
                            }
                        }
                    }
                }
                basic.pause(20);
            }
        })
    }

    /**
     * Read a single character.
     */
    //% block="bluetooth read char"
    //% weight=45
    export function uartReadChar(): string {
        if (_msgBuffer.length > 0) {
            return _msgBuffer.shift();
        }
        return "";
    }

    /**
     * Read until a specific character (For standard sentences).
     * THIS IS THE FIXED FUNCTION.
     */
    //% block="bluetooth uart read until %delimiter"
    //% delimiter.defl=Delimiters.NewLine
    //% weight=40
    export function uartReadUntil(delimiter: Delimiters): string {
        // 1. Convert the Enum to a real string character
        let target = "\n"; 
        if (delimiter == Delimiters.Comma) target = ",";
        if (delimiter == Delimiters.Colon) target = ":";
        if (delimiter == Delimiters.SemiColon) target = ";";
        if (delimiter == Delimiters.Hash) target = "#";

        // 2. Scan the buffer to see if the target exists
        let foundIndex = -1;
        for(let i = 0; i < _msgBuffer.length; i++) {
            if (_msgBuffer[i] == target) {
                foundIndex = i;
                break;
            }
        }

        // 3. If found, stitch the sentence together
        if (foundIndex != -1) {
            let result = "";
            // Pop everything UP TO the target
            for(let k = 0; k < foundIndex; k++) {
                result += _msgBuffer.shift(); // Remove from front and add to result
            }
            _msgBuffer.shift(); // Remove the Target (Delimiter) itself and throw it away
            return result;
        }

        // 4. If not found yet, return empty (wait for more data)
        return "";
    }

    // --- Write Functions ---

    /**
     * Send text to the connected phone app.
     */
    //% block="bluetooth uart write string %msg"
    export function xirkaSendString(msg: string): void {
        control.runInParallel(function() {
            device().writeString(msg);
        })
    }  

    /**
     * Send line to the connected phone app.
     */
    //% block="bluetooth uart write line %msg"
    export function xirkaSendLine(msg: string): void {
        control.runInParallel(function() {
            device().writeString(msg + "\r\n");
        })
    } 

    /**
     * Send a number via Bluetooth.
     */
    //% block="bluetooth uart write number %num"
    export function uartWriteNumber(num: number): void {
        control.runInParallel(function() {
            device().writeString("" + num + "\r\n");
        })
    }

    /**
     * Send a "Name: Value" pair.
     */
    //% block="bluetooth uart write value %name = %value"
    //% weight=50
    export function uartWriteValue(name: string, value: number): void {
        control.runInParallel(function() {
            device().writeString(name + ":" + value + "\r\n");
        })
    }
}