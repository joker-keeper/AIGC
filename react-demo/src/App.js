import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import UploadForm from './pages/UploadForm';
import PDFViewer from './components/PdfViewer';

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/upload-form" element={<UploadForm />} />
        <Route path="/pdf-viewer" element={<PDFViewer />} />
      </Routes>
    </Router>
  );
};

export default App;