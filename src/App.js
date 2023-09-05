import './App.css';
import Error from './components/Error';
import Upload from './components/Upload';
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    // <div className="main-frame">

    //    <Upload></Upload>
    // </div>


    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />}>
        </Route>
        <Route path="/error" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
