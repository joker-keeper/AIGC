import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getFolders = () => axios.get(`${API_URL}/folders`);
export const createFolder = (name) => axios.post(`${API_URL}/folders`, { name });
export const getDocuments = (folderId) => axios.get(`${API_URL}/documents/folder/${folderId}`);
export const uploadDocument = (formData) => axios.post(`${API_URL}/documents/upload`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getDomains = () => axios.get(`${API_URL}/overview/getAllDomains`);
export const createDomain = (name) => axios.post(`${API_URL}/overview/createDomain`, { name });
export const uploadLiterature = (formData) => axios.post(`${API_URL}/overview/uploadLiterature`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getLiteratures = (domainId) => axios.get(`${API_URL}/overview/getLiteraturesByFolder/${domainId}`);