declare module 'google-spreadsheet' {
  export default class GoogleSpreadsheet {
      constructor(apiKey: string);
      getInfo(callback: Function): void;
  }
}

