
import React, { useState } from 'react';
import { Room, RoomAllocation, Detail } from '../types';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface RoomCardProps {
  room: Room;
  allocations: RoomAllocation[];
  allAllocations: RoomAllocation[];
  details: Detail[];
  updateRoomAllocation: (allocation: RoomAllocation) => void;
  deleteRoomAllocation: (id: string) => void;
  addRoomAllocation: (allocation: Omit<RoomAllocation, 'id'| 'started'>) => void;
}

const ProgressBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};


export const RoomCard: React.FC<RoomCardProps> = ({ room, allocations, allAllocations, details, updateRoomAllocation, deleteRoomAllocation, addRoomAllocation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState('');
    const [printersToAllocate, setPrintersToAllocate] = useState('');
    const [error, setError] = useState('');

    const usedPrinters = allocations.reduce((sum, alloc) => sum + alloc.printers, 0);
    const availablePrinters = room.capacity - usedPrinters;

    const handleStatusChange = (allocation: RoomAllocation, change: number) => {
        const newStarted = allocation.started + change;
        if (newStarted >= 0 && newStarted <= allocation.printers) {
            updateRoomAllocation({ ...allocation, started: newStarted });
        }
    };

    const handleStartedManualChange = (allocation: RoomAllocation, value: string) => {
        if (value.trim() === '') {
            updateRoomAllocation({ ...allocation, started: 0 });
            return;
        }
        const newStarted = Number(value);
        if (!isNaN(newStarted) && Number.isInteger(newStarted)) {
            const clampedStarted = Math.max(0, Math.min(newStarted, allocation.printers));
            updateRoomAllocation({ ...allocation, started: clampedStarted });
        }
    };
    
    const handleAddAllocation = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numPrinters = parseInt(printersToAllocate, 10);

        if (!selectedDetailId) {
            setError('Будь ласка, оберіть деталь.');
            return;
        }
        if (isNaN(numPrinters) || numPrinters <= 0) {
            setError('Кількість принтерів повинна бути додатнім числом.');
            return;
        }
        if (numPrinters > availablePrinters) {
            setError(`Недостатньо принтерів. Доступно: ${availablePrinters}.`);
            return;
        }

        addRoomAllocation({
            room: room.name,
            detail_id: selectedDetailId,
            printers: numPrinters,
        });
        
        setIsModalOpen(false);
        setSelectedDetailId('');
        setPrintersToAllocate('');
    };
    
    const selectedDetail = details.find(d => d.id === selectedDetailId);
    const totalAllocatedForDetail = allAllocations
        .filter(a => a.detail_id === selectedDetailId)
        .reduce((sum, a) => sum + a.printers, 0);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col h-full border border-slate-700">
            <div className="mb-4">
                <h3 className="text-2xl font-bold text-white capitalize">{room.name}</h3>
                <p className="text-sm text-cyan-400">Загальна ємність: {room.capacity} принтерів</p>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-300">Використовується: {usedPrinters}</span>
                    <span className="font-semibold text-slate-100">Доступно: {availablePrinters}</span>
                </div>
                <ProgressBar value={usedPrinters} max={room.capacity} />
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                {allocations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Немає активних завдань</p>
                    </div>
                ) : (
                    allocations.map(alloc => {
                        const detail = details.find(d => d.id === alloc.detail_id);
                        if (!detail) return null;
                        const remaining = alloc.printers - alloc.started;
                        return (
                            <div key={alloc.id} className="bg-slate-700/50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white">{detail.name}</p>
                                        <p className="text-xs text-slate-400">{alloc.printers} принтерів</p>
                                    </div>
                                    <button onClick={() => deleteRoomAllocation(alloc.id)} className="text-red-400 hover:text-red-300 text-xl">&times;</button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm whitespace-nowrap">Запущено:</span>
                                        <button onClick={() => handleStatusChange(alloc, -1)} disabled={alloc.started <= 0} className="bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                        <Input
                                            type="number"
                                            aria-label="Кількість запущених принтерів"
                                            value={alloc.started}
                                            onChange={(e) => handleStartedManualChange(alloc, e.target.value)}
                                            className="w-14 text-center py-0 px-1 h-6 bg-slate-900 border-slate-700"
                                            min="0"
                                            max={alloc.printers}
                                        />
                                        <button onClick={() => handleStatusChange(alloc, 1)} disabled={alloc.started >= alloc.printers} className="bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                    </div>
                                    <span className="text-sm text-yellow-400">Залишилось: {remaining}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <div className="mt-auto pt-4">
                <Button onClick={() => setIsModalOpen(true)} disabled={availablePrinters <= 0} className="w-full">
                    Додати завдання
                </Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                 <form onSubmit={handleAddAllocation} className="p-4 bg-slate-800 rounded-lg w-full max-w-sm">
                    <h3 className="text-xl font-bold mb-4 text-white">Додати завдання в "{room.name}"</h3>
                    {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md mb-4">{error}</p>}
                    <div className="space-y-4">
                        <Select value={selectedDetailId} onChange={e => setSelectedDetailId(e.target.value)} required>
                            <option value="">Оберіть деталь...</option>
                            {details.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </Select>
                        {selectedDetail && (
                            <div className="text-sm text-slate-400 bg-slate-700/50 p-2 rounded-md">
                                <p>План: <span className="font-bold text-white">{selectedDetail.plan}</span> шт.</p>
                                <p>Вже розподілено: <span className="font-bold text-white">{totalAllocatedForDetail}</span> принтерів</p>
                            </div>
                        )}
                        <Input 
                            type="number"
                            placeholder={`К-ть принтерів (max ${availablePrinters})`}
                            value={printersToAllocate}
                            onChange={e => setPrintersToAllocate(e.target.value)}
                            max={availablePrinters}
                            min="1"
                            required
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-600 hover:bg-slate-500">Скасувати</Button>
                            <Button type="submit">Додати</Button>
                        </div>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
