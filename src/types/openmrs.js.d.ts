declare module 'openmrs.js' {
    export default class OpenMRS {
        api: APICollection;

        login(username: string, password: string, url: string): Promise<void>;    
    }

    class APICollection {
        encounter: any;
        encountertype: any;
        patient: any;
        program: any;
        programenrollment: any;
        location: any;
        visit: any;
        help(): void;
    }

    class API {
        help(): void;
    }
}
