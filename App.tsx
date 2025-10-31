import React, { useState } from 'react';
import { usePrintFarmData } from './hooks/usePrintFarmData';
import { DetailManager } from './components/DetailManager';
import { AllocationDashboard } from './components/AllocationDashboard';
import { Header } from './components/Header';

type View = 'dashboard' | 'details';

const App: React.FC = () => {
  const {
    data,
    detailNameHistory,
    loading,
    error,
    addDetail,
    updateDetail,
    deleteDetail,
    addRoomAllocation,
    updateRoomAllocation,
    deleteRoomAllocation,
  } = usePrintFarmData();

  const [view, setView] = useState<View>('dashboard');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header view={view} setView={setView} />
      
      <main className="container mx-auto p-4 md:p-6 space-y-8">
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">{error}</div>}
        
        {view === 'dashboard' && (
          <AllocationDashboard
            data={data}
            updateRoomAllocation={updateRoomAllocation}
            deleteRoomAllocation={deleteRoomAllocation}
            addRoomAllocation={addRoomAllocation}
          />
        )}

        {view === 'details' && (
          <DetailManager
            details={data.details}
            allocations={data.allocations}
            detailNameHistory={detailNameHistory}
            addDetail={addDetail}
            updateDetail={updateDetail}
            deleteDetail={deleteDetail}
          />
        )}
      </main>
    </div>
  );
};

export default App;