import GoogleSpreadsheet from 'google-spreadsheet';

import logger from '../config/winston';
import Parser from './Parser';

const LOG_TAG: string = '[GoogleSpreadsheetParser]';

/** Parses a google spreadsheet */
export default class GoogleSpreadsheetParser implements Parser {
    /**
     * Parses a google spreadsheet
     */
    public async parse(spreadsheetId: string) {
        logger.info(`${LOG_TAG} retrieving data for spreadsheet ${spreadsheetId}`);
        const doc = new PromiseGoogleSpreadsheet(spreadsheetId);

        const data = await doc.getInfo();
        logger.info(`${LOG_TAG} successfully loaded spreadsheet ${data.title}`);

        if (!data.worksheets.length) {
            logger.error(`${LOG_TAG} spreadsheet must have at least one workseet. Spreadsheet data: ${JSON.stringify(data, undefined, 2)}`);
            throw new Error(`Google spreadsheet ${data.title} must have at least one worksheet`);
        }

        const firstSheet = data.worksheets[0];
        const rows = await firstSheet.getRows({
            offset: 1, // Ignore the header row
        });
        logger.info(`${LOG_TAG} successfully retrieved ${rows.length} rows`);
    }


}

/**
 * Wraps google-spreadsheet functions, which use callbacks,
 * with functions that return promises
 */
class PromiseGoogleSpreadsheet {
    // The google sheet
    private _doc: GoogleSpreadsheet;

    constructor(spreadsheetId: string) {
        this._doc = new GoogleSpreadsheet(spreadsheetId);
    }

    /** Gets data from the google spreadsheet */
    public getInfo(): Promise<PromiseGoogleSpreadSheetData> {
        const doc = this._doc;

        return new Promise((fulfill, reject) => {
            doc.getInfo((err: Error, data: GoogleSpreadSheetData) => {
                if (err) {
                    reject(err);
                } else {
                    // Convert the worksheet into an async worksheet so we can use async functions
                    fulfill({
                        id: data.id,
                        title: data.title,
                        updated: data.updated,
                        author: data.author,
                        worksheets: data.worksheets.map(w => new PromiseGoogleWorksheet(w)),
                    });
                }
            });
        });
    }
}

/** A wrapper around the google worksheet that exposes promises */
class PromiseGoogleWorksheet {
    // The google worksheet
    private _worksheet: GoogleWorksheet;

    constructor(worksheet: GoogleWorksheet) {
        this._worksheet = worksheet;
    }

    /** Gets rows based on the given query */
    public getRows(query: object): Promise<GoogleRow[]> {
        const worksheet = this._worksheet;

        return new Promise((fulfill, reject) => {
            worksheet.getRows(query, (err: Error, rows: GoogleRow[]) => {
                if (err) {
                    reject(err);
                } else {
                    fulfill(rows);
                }
            });
        });
    }

}

interface SpreadSheetData<T> {
    id: string;
    title: string;
    updated: string;
    author: string;
    worksheets: T[];
}

interface GoogleSpreadSheetData extends SpreadSheetData<GoogleWorksheet> { }

interface PromiseGoogleSpreadSheetData extends SpreadSheetData<PromiseGoogleWorksheet> { }

interface GoogleRow {
    colname: string;
    value: string;
}

interface GoogleWorksheet {
    getRows(query: object, callback: (err: Error, rows: GoogleRow[]) => void): void;
    getCells(query: object, callback: (err: Error, cells: object[]) => void): void;
}
