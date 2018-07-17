import { OpenMRSData } from './openMRSData'

/**
 * Interface for classes that parse openmrs data
 */
export default interface Parser {
    /*
     * Parses the given file
     * @param {string} file - file identifier
     */
    parse(file: string): Promise<OpenMRSData>;
}
