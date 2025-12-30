import { ReactFlowProvider } from 'reactflow';
import { FlowChart } from './components/FlowChart';

function App() {
  return (
    <ReactFlowProvider>
      <FlowChart />
    </ReactFlowProvider>
  );
}

export default App;
