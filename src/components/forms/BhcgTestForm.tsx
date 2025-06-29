
import React from 'react';
import { FormField } from '../FormField';
import { Card, CardContent } from '../ui/card';

interface HeaderData {
  age: string;
  studyNo: string;
  subjectId: string;
  sampleAndSid: string;
  sex: string;
  collectionCentre: string;
  sampleCollectionDate: string;
  registrationDate: string;
  reportDate: string;
}

interface BhcgTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface SignatureData {
  name: string;
  date: string;
  time: string;
}

interface BhcgTestFormProps {
  headerData: HeaderData;
  bhcgTest: BhcgTest;
  evaluatedBy: SignatureData;
  onHeaderChange: (field: keyof HeaderData, value: string) => void;
  onBhcgChange: (field: keyof BhcgTest, value: string) => void;
  onEvaluatedByChange: (field: keyof SignatureData, value: string) => void;
}

export const BhcgTestForm: React.FC<BhcgTestFormProps> = ({
  headerData,
  bhcgTest,
  evaluatedBy,
  onHeaderChange,
  onBhcgChange,
  onEvaluatedByChange
}) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Header Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Laboratory Report Header</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Age"
              value={headerData.age}
              onChange={v => onHeaderChange('age', v)}
            />
            <FormField
              label="Study No"
              value={headerData.studyNo}
              onChange={v => onHeaderChange('studyNo', v)}
            />
            <FormField
              label="Subject ID"
              value={headerData.subjectId}
              onChange={v => onHeaderChange('subjectId', v)}
            />
            <FormField
              label="Sample & SID"
              value={headerData.sampleAndSid}
              onChange={v => onHeaderChange('sampleAndSid', v)}
            />
            <FormField
              label="Sex"
              type="select"
              options={['Male', 'Female', 'Other']}
              value={headerData.sex}
              onChange={v => onHeaderChange('sex', v)}
            />
            <FormField
              label="Collection Centre"
              value={headerData.collectionCentre}
              onChange={v => onHeaderChange('collectionCentre', v)}
            />
            <FormField
              label="Sample Collection Date"
              type="date"
              value={headerData.sampleCollectionDate}
              onChange={v => onHeaderChange('sampleCollectionDate', v)}
            />
            <FormField
              label="Registration Date"
              type="date"
              value={headerData.registrationDate}
              onChange={v => onHeaderChange('registrationDate', v)}
            />
            <FormField
              label="Report Date"
              type="date"
              value={headerData.reportDate}
              onChange={v => onHeaderChange('reportDate', v)}
            />
          </div>
        </div>

        {/* Clinical Biochemistry Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">CLINICAL BIOCHEMISTRY</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">TEST DESCRIPTION</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">RESULT</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">UNITS</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">REFERENCE RANGES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="text-sm">Beta Human Chorionic Gonadotropin Hormone</div>
                    <div className="text-xs text-gray-500">(Method: Spectrophotometry)</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <FormField
                      label="Result"
                      value={bhcgTest.result}
                      onChange={v => onBhcgChange('result', v)}
                      placeholder="Enter result"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="px-3 py-2 bg-gray-50 rounded border">
                      {bhcgTest.unit}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="px-3 py-2 bg-gray-50 rounded border">
                      {bhcgTest.referenceRange}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Evaluated By Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Evaluated By</h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Name"
              value={evaluatedBy.name}
              onChange={v => onEvaluatedByChange('name', v)}
            />
            <FormField
              label="Date"
              type="date"
              value={evaluatedBy.date}
              onChange={v => onEvaluatedByChange('date', v)}
            />
            <FormField
              label="Time"
              type="text"
              value={evaluatedBy.time}
              onChange={v => onEvaluatedByChange('time', v)}
              placeholder="HH:MM"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
