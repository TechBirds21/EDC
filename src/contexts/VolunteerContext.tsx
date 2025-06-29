import React, { createContext, useState, useContext, ReactNode } from 'react';

interface VolunteerContextType {
  volunteerId: string;
  screeningDate: string;
  setVolunteerId: (id: string) => void;
  setScreeningDate: (date: string) => void;
}

const VolunteerContext = createContext<VolunteerContextType>({
  volunteerId: '',
  screeningDate: '',
  setVolunteerId: () => {},
  setScreeningDate: () => {},
});

export const useVolunteerContext = () => useContext(VolunteerContext);

interface VolunteerProviderProps {
  children: ReactNode;
}

export const VolunteerProvider: React.FC<VolunteerProviderProps> = ({ children }) => {
  const [volunteerId, setVolunteerId] = useState<string>('');
  const [screeningDate, setScreeningDate] = useState<string>('');

  const value = {
    volunteerId,
    screeningDate,
    setVolunteerId,
    setScreeningDate,
  };

  return (
    <VolunteerContext.Provider value={value}>
      {children}
    </VolunteerContext.Provider>
  );
};

export { VolunteerContext };