import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import SearchForm from './SearchForm';
import ResultsSchedule from './ResultsSchedule';
import { useState } from 'react';

function App() {
  const [schedules, setSchedules] = useState([]);
  return (
    <div className="App mt-5 px-1">
      <SearchForm onSubmit={setSchedules} />
      <ResultsSchedule schedules={schedules} />
    </div>
  );
}

export default App;
