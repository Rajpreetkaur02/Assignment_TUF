import './App.css';
import { Route, Routes } from 'react-router-dom';
import Page1 from './Pages/Page1'
import Page2 from './Pages/Page2';

export default function App() {
  return (
    <div>
      <Routes>
        <Route exact path='/' element={<Page1/>}></Route>
        <Route exact path='/page2' element={<Page2/>}></Route>
      </Routes>
    </div>

  );
}

