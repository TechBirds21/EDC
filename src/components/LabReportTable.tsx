
import React from 'react';
import type { LabTestResult } from '../types/lab-report';

interface LabReportTableProps {
  tests: LabTestResult[];
  onChange: (tests: LabTestResult[]) => void;
  disabled?: boolean;
}

export const LabReportTable: React.FC<LabReportTableProps> = ({
  tests,
  onChange,
  disabled = false
}) => {
  const updateTest = (index: number, field: keyof LabTestResult, value: string) => {
    const updatedTests = tests.map((test, i) =>
      i === index ? { ...test, [field]: value } : test
    );
    onChange(updatedTests);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left border-r">Parameter</th>
            <th className="px-4 py-2 text-left border-r">Result</th>
            <th className="px-4 py-2 text-left border-r">Unit</th>
            <th className="px-4 py-2 text-left border-r">Reference Range</th>
            <th className="px-4 py-2 text-left">Flag</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2 border-r font-medium">{test.parameter}</td>
              <td className="px-4 py-2 border-r">
                <input
                  type="text"
                  value={test.result}
                  onChange={(e) => updateTest(index, 'result', e.target.value)}
                  className="w-full p-1 border rounded"
                  disabled={disabled}
                />
              </td>
              <td className="px-4 py-2 border-r">{test.unit}</td>
              <td className="px-4 py-2 border-r">{test.referenceRange}</td>
              <td className="px-4 py-2">
                <select
                  value={test.flag || ''}
                  onChange={(e) => updateTest(index, 'flag', e.target.value as any)}
                  className="w-full p-1 border rounded"
                  disabled={disabled}
                >
                  <option value="">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
