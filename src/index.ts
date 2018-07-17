import logger from './config/winston';
import OpenMRS from 'openmrs.js';
import GoogleSpreadsheetParser from './parsers/googleSpreadsheetParser';

import config from './config/config'

const LOG_TAG = '[odi]';


const run = async () => {
    // Instantiate open mrs
    const openMRS = new OpenMRS();
    
    // Login
    await openMRS.login(config.username, config.password, config.openMRSUrl);

    openMRS.api.encounter.help();
    //openMRS.api.encountertype.help();
    //openMRS.api.patient.help();
    openMRS.api.program.help();
    openMRS.api.programenrollment.help();
    openMRS.api.location.help();
    //openMRS.api.visit.help();

    openMRS.api.location.getAllLocations();

    const parser = new GoogleSpreadsheetParser();
    await parser.parse('1cyT6l89nDGAMyGjqt3j0V7-GjD87paPlgasnuQrrOvo'); // Parse the example 
}

run();
