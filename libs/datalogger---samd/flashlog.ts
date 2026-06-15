/**
 * Storing structured data in flash.
 */
//%
namespace flashlog {
  export const DEVICE_LOG_EVT_LOG_FULL = 1;
  const DEVICE_LOG_DEBUG = false;
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
  interface BlockEntry {
    logNumber: number;
    logOffset: number;
  }

  let rowCount = 0;
  let byteCount = 0;
  let status = 0;
  let keys: string[] = [];
  let entry: LogEntry = {};
  let blockMap: BlockEntry[] = [{logNumber: 0, logOffset: 0}];
  let timestampFormat: FlashLogTimeStampFormat = FlashLogTimeStampFormat.Seconds;

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
        `Time (${
          (timestampFormat < FlashLogTimeStampFormat.Seconds) ? "ms" :
          (timestampFormat < FlashLogTimeStampFormat.Minutes) ? "sec." :
          (timestampFormat < FlashLogTimeStampFormat.Hours) ? "min." :
          (timestampFormat < FlashLogTimeStampFormat.Days) ? "hrs." :
          "days"
        })`
      ;
      let headings = timeStampHeading + (timeStampHeading ? "," : "") + keys.join(",") + "\n";
      if (rowCount > 0) headings = "\n" + headings;
      writeRow(headings);
      status &= ~StatusFlags.NEW_HEADINGS;
    }

    const timeStamp =
      (timestampFormat === FlashLogTimeStampFormat.None) ? "" : 
      (timestampFormat < FlashLogTimeStampFormat.Seconds) ? control.millis().toString() :
      ((Math.round(control.millis() / timestampFormat)/100).toString() + ",")
    ;
    let rowData: string = "";
    let dataCount = 0;
    keys.forEach(k => {
      if (!entry[k]) return;
      dataCount += entry[k].length;
      rowData += entry[k] + ",";
    });
    if (dataCount > 0) {
      rowData = timeStamp + rowData.slice(0, -1) + "\n"; // Remove trailing comma
      writeRow(rowData);
    }

    status &= ~(StatusFlags.ROW_STARTED | StatusFlags.NEW_HEADINGS);
    return DAL.DEVICE_OK;
  }

  function writeRow(rowData: string): void {
    writeString("log" + rowCount, rowData);
    settings.writeNumber("logCount", rowCount+1);
    if (status & StatusFlags.SERIAL_MIRROR) {
      const rows = rowData.split("\n");
      rows.forEach(r => {
        if (r) console.log("[Log] " + r);
      });
    }
    
    if ((byteCount + rowData.length) > (blockMap.length * 512)) {
      blockMap.push({
        logNumber: rowCount,
        logOffset: (blockMap.length * 512 - byteCount)
      });
    }
    rowCount++;
    byteCount += rowData.length;
    setFileSize(byteCount);
    if (DEVICE_LOG_DEBUG)
      console.log(`Completed row ${rowCount-1} with ${rowData.length} bytes, total byte count is now ${byteCount}`);
  }

  function init(): void {
    if (status & StatusFlags.INITIALIZED) return;

    setDebug(DEVICE_LOG_DEBUG);
    rowCount = settings.readNumber("logCount") || 0;
    for (let i = 0; i < rowCount; i++) {
      const rowBuffer = settings.readBuffer("log" + i);
      if (!rowBuffer) continue;

      if ((byteCount + rowBuffer.length) > (blockMap.length * 512)) {
        blockMap.push({
          logNumber: (i),
          logOffset: (blockMap.length * 512 - byteCount)
        });
      }
      byteCount += rowBuffer.length;
    }

    control.enableUsbMsc();
    addFile(renderFile, "MY_DATA.csv", ((typeof config.SETTINGS_SIZE !== 'undefined') ? config.SETTINGS_SIZE : config.SETTINGS_SIZE_DEFL));
    addFile(renderFileHtml, "MY_DATA.HTM", 0x1F000);
    setFileSize(byteCount);

    status |= StatusFlags.INITIALIZED;
  }

  init();

  //% shim=flashlog::setDebug
  function setDebug(enabled: boolean): void {
    return;
  }

  function renderFile(blockNumber: number, buffer: Buffer) : void {
    if (DEVICE_LOG_DEBUG) {
      console.log(`Requested block ${blockNumber} into buffer at ${buffer as any as number} with current log count ${rowCount} and byte count ${byteCount}`);
      console.log(`Current block map:`);
      blockMap.forEach((b, i) => {
        console.log(`  Block ${i}: logNumber=${b.logNumber}, logOffset=${b.logOffset}`);
      });
    }
    if ((blockNumber * 512) > byteCount) {
      // Requested block is beyond the end of the data, so return an empty block
      buffer.fill(0xFF);
      return;
    }

    let writeCount = 0;
    for (let i = blockMap[blockNumber].logNumber; i < rowCount; i++) {
      let rowBuffer = settings.readBuffer("log" + i);
      if (!rowBuffer) continue;

      if (i === blockMap[blockNumber].logNumber) {
        // If this is the first row in the block, we may need to slice off the start of it based on the logOffset
        rowBuffer = rowBuffer.slice(blockMap[blockNumber].logOffset);
      }
      if ((writeCount + rowBuffer.length) > 512) {
        // This row would exceed the block size
        rowBuffer = rowBuffer.slice(0, 512 - writeCount);
      }

      buffer.write(writeCount, rowBuffer);
      writeCount += rowBuffer.length;
      if (writeCount >= 512) {
        // We've filled the block, so stop writing more rows
        break;
      }
    }
    
    if (DEVICE_LOG_DEBUG)
      console.log(`Written ${writeCount} bytes`);

    if (writeCount < 512) {
      // If we have space left in the block after writing all rows, fill the rest with 0s
      buffer.fill(0xFF, writeCount);
    }

    if (DEVICE_LOG_DEBUG) {
      console.log(buffer.toHex());
      console.log('.');
    }
  }

  function renderFileHtml(blockNumber: number, buffer: Buffer) : void {
    // File layout:
    // - 0 to 0x7FF: header
    // - 0x800 to 0x811: 'UBIT_LOG_FS_V_002' tag and newline
    // - 0x812 to 0x81C: Location of last 4 bytes of the file, in %010p, null-terminated. Log full tag is saved in the location
    // - 0x81D to 0x827: Location of CSV data in the file, in %010p, null-terminated.
    // - 0x828 to 0x82C: '0257', null-terminated. Unknown
    // - 0x82D to 0xFFF: Column names, newline-terminated then 0xFF.
    // - 0x1000 to 0x1FFF: '00000000' then 0xFF
    // - 0x2000 to 0x1EFFB: CSV contents, newline-terminated then 0xFF.
    // - 0x1EFFC to 0x1EFFF: 4-byte null.
    
    const header = '<!doctype html><meta charset=utf-8><style>.bb{display:flex}.bb>*+*{margin-left:10px}body{font-family:sans-serif;margin:1em}table{border-collapse:collapse;margin-top:1em;text-align:right}tr:first-child{font-weight:700}td{border:1px solid #ddd;padding:8px;min-width:8ch}iframe{display:none}</style><script>let w=window,d=document,l=w.location,n=null,csv="",tag=d.createElement.bind(d);w.dl={mode:"default",download:function(){let e=tag("a");e.download="microbit.csv",e.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),e.click(),e.remove()},copy:function(){navigator.clipboard.writeText(csv.replace(/\\,/g,"\\t"))},update:alert.bind(n,"Unplug your micro:bit, then plug it back in and wait"),clear:alert.bind(n,"The log is cleared when you reflash your micro:bit"),load:function(){let a=d.querySelector("#w"),o=d.documentElement.outerHTML.split("FS_START")[2];if(/^UBIT_LOG_FS_V_002/.test(o)){let t=parseInt;var n=t(o.substr(29,10),16)-2048;let e=0;for(;65533!=o.charCodeAt(n+e);)e++;csv=o.substr(n,e);let r=0;for(let e=0;e<o.length;++e)r=31*r+o.charCodeAt(e),r|=0;var i=l.href.split("?")[1];if(void 0!==i)i!=r&&parent.postMessage("diff","*");else{i=t(o.substr(18,10),16);"FUL"===o.substr(i-2048+1,3)&&(a.appendChild(tag("p")).innerText="LOG FULL");let n=a.appendChild(tag("table"));csv.split("\\n").forEach(function(e){let t=n.insertRow();e&&e.split(",").forEach(function(e){t.insertCell().innerText=e})}),w.onmessage=function(e){"diff"==e.data&&l.reload()};let e;setInterval(function(){e&&e.remove(),e=a.appendChild(tag("iframe")),e.src=l.href+"?"+r},5e3)}}}}</script><base href=https://data.microbit.org><script src=v3/dl.js></script><title>micro:bit data log</title><body onload=dl.load()><div id=w><h1>micro:bit data log</h1><div class=bb><button onclick=dl.download()>Download</button><button onclick=dl.copy()>Copy</button><button onclick=dl.update()>Update data&mldr;</button><button onclick=dl.clear()>Clear log&mldr;</button></div><p id=v>Offline: no visual preview</div>                                                   <!--FS_START'; // size 0x800 = 4 blocks

    if (blockNumber < 4) { // 0 - 0x7FF
      const headerBuffer = control.createBufferFromUTF8(header);
      buffer.write(0, headerBuffer.slice(blockNumber*512, 512));
    }
    else if (blockNumber == 4) { // 0x800 - 0x9FF
      const block = control.createBufferFromUTF8("UBIT_LOG_FS_V_002\x0A0x0001EFFC\x000x00002000\x000257\x00");
      buffer.write(0, block);
      const header = settings.readBuffer("log0");
      buffer.write(0x2D, header);
      buffer.fill(0xFF, 0x2D + header.length);
    }
    else if (blockNumber*512 < 0x1000) { // 0xA00 - 0xFFF
      buffer.fill(0xFF);
    }
    else if (blockNumber == (0x1000/512)) { // 0x1000 - 0x11FF
      buffer.fill(0, 0, 4);
      buffer.fill(0xFF, 4);
    }
    else if (blockNumber < (0x2000/512)) { // 0x1200 - 0x1FFF
      buffer.fill(0xFF);
    }
    else if (blockNumber >= (0x1EE00/512)) { // 0x1EE00 - ...
      buffer.fill(0xFF);
      buffer.fill(0, (512-4));
    }
    else { // 0x2000 - 0x1EDFF
      renderFile((blockNumber - (0x2000/512)), buffer);
    }
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
    init();
    return rowCount - fromRowIndex;
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
    init();
    let rowsString = "";
    for (let i = fromRowIndex; i < fromRowIndex + nRows && i < rowCount; i++) {
      const rowData = settings.readString("log" + i);
      if (rowData) {
        rowsString += rowData;
      }
    }
    return rowsString;
  }

  //% shim=flashlog::addFile
  export function addFile(action: (blockNumber: number, buffer: Buffer) => void, fileName: string, fileSize: number) {
    return;
  }

  //% shim=flashlog::setFileSize
  export function setFileSize(fileSize: number) {
    return;
  }
}
