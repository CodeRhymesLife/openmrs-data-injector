export interface OpenMRSData {
    [testId: string]: OpenMRSTest;
}

export interface OpenMRSTest {
    id: string;
    patients: OpenMRSPatientMap;
}

export interface OpenMRSPatientMap {
    [nid: string]: OpenMRSPatient;
}

export interface OpenMRSPatient {
    nid: string;

    location: string;

    sex: OpenMRSSex;

    birthdate: Date;

    encounters: OpenMRSEncounter[];
}

export interface OpenMRSEncounter {
    type: string;

    startDate: Date;

    location: string;
}

export enum OpenMRSSex {
    Male = 'M',
    Female = 'F',
}
