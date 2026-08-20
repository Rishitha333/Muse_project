import axios from "axios";

const API_URL = "http://127.0.0.1:5000/analyze";

export const analyzeCallApi = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
