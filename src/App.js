import './App.css';
import MapWithMarkers from './Components/Markers/MarkerMap';
import MapWithMarkersAndCharts from './Components/Markers/MarkersTwo';

function App() {
  return (
    <div className="wrap">
      <div className='container'>
        <MapWithMarkersAndCharts />
      </div>
    </div>
  );
}

export default App;
