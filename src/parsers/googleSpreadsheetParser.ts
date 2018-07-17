import _ from 'lodash';
import GoogleSpreadsheet from 'google-spreadsheet';

import logger from '../config/winston';
import Parser from './parser';
import { OpenMRSData, OpenMRSEncounter, OpenMRSPatient, OpenMRSSex, OpenMRSTest } from './openMRSData'

const LOG_TAG: string = '[GoogleSpreadsheetParser]';

/** Parses a google spreadsheet */
export default class GoogleSpreadsheetParser implements Parser {
    /**
     * Parses a google spreadsheet
     */
    public async parse(spreadsheetId: string): Promise<OpenMRSData> {
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
        //logger.info(`${LOG_TAG} ${JSON.stringify(rows, null, 2)} rows`);

        return this.rowsToOpenMRS(rows);
    }

    /** Maps google spread sheet rows to the Open MRS Data format */
    private rowsToOpenMRS(rows: GoogleRow[]): OpenMRSData {
        logger.info(`${LOG_TAG} converting rows to the open mrs data format`);
        
        const data: OpenMRSData = {};

        const getOrCreateTest = (row: GoogleRow): OpenMRSTest => {
            const testId = row['testid'];
            let test = data[testId];
            if(!test) {
                test = data[testId] = {
                    id: testId,
                    patients: {},
                };
            }

            return test;
        }

        const getOrCreatePatient = (row: GoogleRow): OpenMRSPatient => {
            const nid = row['nid']
            const test = getOrCreateTest(row);
            let patient = test.patients[nid];
            if(!patient) {
                const sexString = row['gender'].toUpperCase() as keyof typeof OpenMRSSex;
                patient = test.patients[nid] = {
                    nid,
                    location: '',
                    sex: OpenMRSSex[sexString],
                    birthdate: new Date(row['dateofbirth']),
                    encounters: <OpenMRSEncounter[]>[],
                }
            }

            return patient;
        }

        const addEncounters = (row: GoogleRow): OpenMRSEncounter => {
            const patient = getOrCreatePatient(row);
            
            if(row['artstartdatevisit']) {
                patient.encounters.push({
                    type: '',
                    startDate: new Date(row['artstartdatevisit']),
                    location: '',
                });
            }
            return <OpenMRSEncounter>null;
        }

        rows.forEach((row) => {
             const patient: OpenMRSPatient = getOrCreatePatient(row);
        });

        return data;
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
                        worksheets: _.map(data.worksheets, w => new PromiseGoogleWorksheet(w)),
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
    [key: string]: string;
}

interface GoogleWorksheet {
    getRows(query: object, callback: (err: Error, rows: GoogleRow[]) => void): void;
    getCells(query: object, callback: (err: Error, cells: object[]) => void): void;
}
