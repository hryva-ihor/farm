
import React from 'react';
import { PrintFarmData, RoomAllocation } from '../types';
import { ROOMS } from '../constants';
import { RoomCard } from './RoomCard';

interface AllocationDashboardProps {
  data: PrintFarmData;
  updateRoomAllocation: (allocation: RoomAllocation) => void;
  deleteRoomAllocation: (id: string) => void;
  addRoomAllocation: (allocation: Omit<RoomAllocation, 'id' | 'started'>) => void;
}

export const AllocationDashboard: React.FC<AllocationDashboardProps> = ({ data, updateRoomAllocation, deleteRoomAllocation, addRoomAllocation }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-slate-100">Панель керування фермою</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ROOMS.map(room => (
          <RoomCard
            key={room.name}
            room={room}
            allocations={data.allocations.filter(a => a.room === room.name)}
            allAllocations={data.allocations}
            details={data.details}
            updateRoomAllocation={updateRoomAllocation}
            deleteRoomAllocation={deleteRoomAllocation}
            addRoomAllocation={addRoomAllocation}
          />
        ))}
      </div>
    </section>
  );
};
