/**
 * Storing structured data in flash.
 */
//%
namespace flashlog {
  export const DEVICE_LOG_EVT_LOG_FULL = 1;
  const enum StatusFlags {
    INITIALIZED = (1 << 0),
    ROW_STARTED = (1 << 1),
    FULL = (1 << 2),
    SERIAL_MIRROR = (1 << 3),
    BUSY = (1 << 4),
    NEW_HEADINGS = (1 << 5)
  }
  interface LogEntry {
    [key: string]: string;
  }
  interface SettingEntry {
    [key: string]: Buffer;
  }

  let rowCount = 0;
  let status = StatusFlags.NEW_HEADINGS;
  let keys: string[] = [];
  let entry: LogEntry = {};
  let timestampFormat: FlashLogTimeStampFormat = FlashLogTimeStampFormat.Seconds;

  function rowCurrent() {
    return rowCount - 1;
  }
  function runExclusive<T>(fn: () => T): T {
    while (status & StatusFlags.BUSY) {
      // Wait for any ongoing operations to finish before starting a new one
      loops.pause(1);
    }
    status |= StatusFlags.BUSY;
    const result = fn();
    status &= ~StatusFlags.BUSY;
    return result;
  }

  /**
  * Creates a new row in the log, ready to be populated by logData()
  **/
  //% help=flashlog/begin-row
  //% parts="flashlog"
  //% blockGap=8
  export function beginRow() : number {
    return runExclusive(_beginRow);
  }

  function _beginRow() : number {
    if (status & StatusFlags.ROW_STARTED) {
      // Previous row was not completed, so end it now before starting a new one
      _endRow();
    }
    
    rowCount++;
    // entries.length = 0;
    entry = {};

    status |= StatusFlags.ROW_STARTED;
    return DAL.DEVICE_OK;
  }

  /**
  * Populates the current row with the given key/value pair.
  **/
  //% help=flashlog/log-data
  //% parts="flashlog"
  //% blockGap=8
  export function logData(key: string, value: string) : number {
    return runExclusive(() => {return _logData(key, value)});
  }

  function _logData(key: string, value: string) : number {
    if (!(status & StatusFlags.ROW_STARTED)) {
      // No row has been started, so start one now before logging data
      _beginRow();
    }

    const keyFound = keys.indexOf(key);
    if (keyFound === -1) {
      status |= StatusFlags.NEW_HEADINGS;
      keys.push(key);
    }

    // entries.push({ key: key, value: value });
    entry[key] = value;
    return DAL.DEVICE_OK;
  }

  /**
  * Complete a row in the log, and pushes to persistent storage.
  **/
  //% help=flashlog/end-row
  //% parts="flashlog"
  //% blockGap=8
  export function endRow() : number {
    return runExclusive(_endRow);
  }
  function _endRow() : number {
    if (!(status & StatusFlags.ROW_STARTED)) {
      // No row has been started, so nothing to end
      return DAL.DEVICE_OK;
    }

    init();
    if (status & StatusFlags.NEW_HEADINGS) {
      // If there are new headings, we need to write them before the row data
      const timeStampHeading =
        (timestampFormat === FlashLogTimeStampFormat.None   ) ? "" :
        `Timestamp (${
          (timestampFormat < FlashLogTimeStampFormat.Seconds) ? "ms" :
          (timestampFormat < FlashLogTimeStampFormat.Minutes) ? "sec." :
          (timestampFormat < FlashLogTimeStampFormat.Hours) ? "min." :
          (timestampFormat < FlashLogTimeStampFormat.Days) ? "hrs." :
          "days"
        })`
      ;
      const headings = "\n" + timeStampHeading + (timeStampHeading ? "," : "") + keys.join(",");
      writeString("log" + rowCurrent(), headings);
      
      rowCount++;
      status &= ~StatusFlags.NEW_HEADINGS;
    }

    const timeStamp =
      (timestampFormat === FlashLogTimeStampFormat.None) ? "" : 
      (timestampFormat < FlashLogTimeStampFormat.Seconds) ? control.millis().toString() :
      ((control.millis() / timestampFormat).toString() + ",")
    ;
    let rowData: string = "";
    keys.forEach(k => {
      rowData += (!!entry[k] ? entry[k] : "") + ",";
    });
    writeString("log" + rowCurrent(), "\n" + timeStamp + rowData.slice(0, -1)); // Remove trailing comma
    settings.writeNumber("logCount", rowCount);
    
    status &= ~(StatusFlags.ROW_STARTED | StatusFlags.NEW_HEADINGS);
    return DAL.DEVICE_OK;
  }

  function init(): void {
    if (status & StatusFlags.INITIALIZED) return;

    rowCount = settings.readNumber("logCount") || 0;
    status |= StatusFlags.INITIALIZED;
  }

  //% shim=settings::_set
  function _set(key: string, data: Buffer): int32 {
    console.log("Simulation implementation of flashlog._set called!");
    settings.writeBuffer(key, data);
    return 0;
  }

  function writeString(key: string, value: string): void {
    if (_set(key, control.createBufferFromUTF8(value))) {
      control.raiseEvent(DAL.DEVICE_ID_LOG, DEVICE_LOG_EVT_LOG_FULL);
      loops.pause(100); // Allow time for event handler to run and update status before next log entry is attempted
    }
    else if (status & StatusFlags.SERIAL_MIRROR) {
      console.log(`Logged: ${key} = ${value}`);
    }
  }

  /**
  * Resets all data stored in persistent storage.
  **/
  //% help=flashlog/clear
  //% parts="flashlog"
  //% blockGap=8
  export function clear(fullErase: boolean) : void {
    const lastCount = settings.readNumber("logCount") || 0;
    if (!lastCount && !fullErase)
      return;
    
    for (let i = 0; i < lastCount; i++) {
      settings.remove("log" + i);
    }
    settings.remove("logCount");

    if (!fullErase) return;

    // Backup other user settings first...
    const userKeys = settings.list();
    const userSettings : SettingEntry = {};
    userKeys.forEach(k => {
      userSettings[k] = settings.readBuffer(k);
    });
    // ... before clearing all settings...
    settings.clear();

    // ... and then restoring them afterwards
    Object.keys(userSettings).forEach(k => {
      settings.writeBuffer(k, userSettings[k]);
    });
  }

  /**
  * Determines the format of the timestamp data to be added (if any).
  * If requested, time stamps will be automatically added to each row of data
  * as an integer value rounded down to the unit specified.
  *
  * @param format The format of timestamp to use.
  */
  //% help=flashlog/set-timestamp
  //% parts="flashlog"
  //% blockGap=8
  export function setTimeStamp(format: FlashLogTimeStampFormat) : void {
    if (format === timestampFormat) return;
    
    timestampFormat = format;
    status |= StatusFlags.NEW_HEADINGS;
  }

  /**
   * Defines if data logging should also be streamed over the serial port.
   *
   * @param enable True to enable serial port streaming, false to disable.
  */
  //% help=flashlog/set-serial-mirroring
  //% parts="flashlog"
  //% blockGap=8
  export function setSerialMirroring(enable: boolean) : void {
    if (enable) {
      status |= StatusFlags.SERIAL_MIRROR;
    } else {
      status &= ~StatusFlags.SERIAL_MIRROR;
    }
  }

  /**
  * Number of rows currently used by the datalogger, start counting at fromRowIndex
  * Treats the header as the first row
  * @param fromRowIndex 0-based index of start: Default value of 0
  * @returns header + rows
  */
  //%
  export function getNumberOfRows(fromRowIndex: number = 0): number {
    return DAL.DEVICE_NOT_IMPLEMENTED;
  }

  /**
  * Get all rows separated by a newline & each column separated by a comma.
  * Starting at the 0-based index fromRowIndex & counting inclusively until nRows.
  * @param fromRowIndex 0-based index of start
  * @param nRows inclusive count from fromRowIndex
  * @returns String where newlines denote rows & commas denote columns
  */
  //%
  export function getRows(fromRowIndex: number, nRows: number): string {
    return "";
  }
}
