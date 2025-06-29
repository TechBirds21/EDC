
export const volunteerService = {
  getOrCreateVolunteer: async (volunteerId: string, studyNo: string) => {
    // For demo purposes, just return a mock volunteer object
    return {
      id: volunteerId,
      study_number: studyNo,
      created_at: new Date().toISOString()
    };
  }
};
