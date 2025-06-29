
export interface LabReportHeader {
  patientName: string;
  patientId: string;
  age: string;
  gender: string;
  collectionDate: string;
  reportDate: string;
  referringPhysician: string;
  labNumber: string;
}

export interface LabTestResult {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag?: 'High' | 'Low' | 'Normal';
}

export interface PathologistInfo {
  name: string;
  qualification: string;
  signature: string;
  date: string;
}

export interface BiochemistryTest {
  result: string;
  unit: string;
  referenceRange: string;
}

export interface LabReportBaseForm {
  headerData: {
    age: string;
    studyNo: string;
    subjectId: string;
    sampleAndSid: string;
    sex: string;
    collectionCentre: string;
    sampleCollectionDate: string;
    registrationDate: string;
    reportDate: string;
  };
  pathologist1: {
    name: string;
    specialty: string;
  };
  pathologist2: {
    name: string;
    specialty: string;
  };
}

export const REFERENCE_RANGES = {
  creatinine: {
    unit: 'mg/dL',
    male: '0.7 - 1.3',
    female: '0.6 - 1.1'
  },
  uricAcid: {
    unit: 'mg/dL',
    male: '3.4 - 7.0',
    female: '2.4 - 6.0'
  },
  bilirubinTotal: {
    unit: 'mg/dL',
    range: '0.3 - 1.2'
  },
  ast: {
    unit: 'U/L',
    male: '≤ 40',
    female: '≤ 32'
  },
  alt: {
    unit: 'U/L',
    male: '≤ 41',
    female: '≤ 33'
  },
  alp: {
    unit: 'U/L',
    male: '40 - 129',
    female: '35 - 104'
  },
  proteinTotal: {
    unit: 'g/dL',
    range: '6.6 - 8.3'
  },
  albumin: {
    unit: 'g/dL',
    range: '3.5 - 5.2'
  },
  cholesterolTotal: {
    unit: 'mg/dL',
    range: '< 200'
  },
  sodium: {
    unit: 'mmol/L',
    range: '136 - 145'
  },
  potassium: {
    unit: 'mmol/L',
    range: '3.5 - 5.1'
  },
  chloride: {
    unit: 'mmol/L',
    range: '98 - 107'
  }
};
