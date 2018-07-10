import logger from './config/winston';
import GoogleSpreadsheetParser from './parsers/googleSpreadsheetParser';

const LOG_TAG = '[odi]';

logger.info(`${LOG_TAG} test log`);

const parser = new GoogleSpreadsheetParser();
parser.parse('1cyT6l89nDGAMyGjqt3j0V7-GjD87paPlgasnuQrrOvo'); // Parse the example

