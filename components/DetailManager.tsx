import React, { useState, useEffect } from 'react';
import { Detail, RoomAllocation } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AutocompleteInput } from './ui/AutocompleteInput';

interface DetailManagerProps {
  details: Detail[];
  allocations: RoomAllocation[];
  detailNameHistory: string[];
  addDetail: (detail: Omit<Detail, 'id'>) => void;
  updateDetail: (detail: Detail) => void;
  deleteDetail: (id: string) => void;
}

export const DetailManager: React.FC<DetailManagerProps> = ({ details, allocations, detailNameHistory, addDetail, updateDetail, deleteDetail }) => {
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('');

  const startedPrintersByDetail = allocations.reduce((acc, alloc) => {
    if (!acc[alloc.detail_id]) {
        acc[alloc.detail_id] = 0;
    }
    acc[alloc.detail_id] += alloc.started;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (editingDetail) {
      setName(editingDetail.name);
      setPlan(editingDetail.plan.toString());
    }
  }, [editingDetail]);
  
  const clearForm = () => {
      setName('');
      setPlan('');
      setEditingDetail(null);
  }

  const handleSelectForEdit = (detail: Detail) => {
      setEditingDetail(detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  const handleCancelEdit = () => {
      clearForm();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const detailData = {
      name,
      plan: parseInt(plan, 10)
    };

    if (editingDetail) {
      updateDetail({ ...detailData, id: editingDetail.id });
    } else {
      addDetail(detailData);
    }
    clearForm();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю деталь? Це також видалить усі пов\'язані з нею завдання.')) {
        deleteDetail(id);
        if(editingDetail?.id === id) {
            clearForm();
        }
    }
  }

  return (
    <section>
        <h2 className="text-3xl font-bold mb-6 text-slate-100">Керування Деталями</h2>

        <div className="p-6 bg-slate-800 rounded-lg mb-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">{editingDetail ? 'Редагувати деталь' : 'Додати нову деталь'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AutocompleteInput
                    placeholder="Назва деталі"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    suggestions={detailNameHistory}
                    required
                    className="lg:col-span-2"
                />
                <Input type="number" placeholder="Кількість (план)" value={plan} onChange={e => setPlan(e.target.value)} required min="1" />
                <div className="flex gap-2">
                    <Button type="submit" className="flex-1">{editingDetail ? 'Оновити' : 'Додати'}</Button>
                    {editingDetail && (
                        <Button type="button" onClick={handleCancelEdit} className="bg-slate-600 hover:bg-slate-500">Скасувати</Button>
                    )}
                </div>
            </form>
        </div>
        
        <h3 className="text-2xl font-semibold mb-4 text-slate-300">Список деталей</h3>
        <div className="overflow-x-auto">
            <div className="min-w-full bg-slate-800 rounded-lg border border-slate-700">
              {details.length === 0 ? (
                 <p className="text-slate-400 text-center p-8">Немає деталей для відображення. Додайте першу деталь, використовуючи форму вище.</p>
              ) : (
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Назва деталі</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">План (шт)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Запущено (шт)</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Дії</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                    {details.map(d => (
                        <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{d.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{d.plan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{startedPrintersByDetail[d.id] || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex gap-2 justify-end">
                                    <Button onClick={() => handleSelectForEdit(d)} className="bg-yellow-500 hover:bg-yellow-600 text-white !py-1 !px-3 text-xs">Редагувати</Button>
                                    <Button onClick={() => handleDelete(d.id)} className="bg-red-600 hover:bg-red-700 text-white !py-1 !px-3 text-xs">Видалити</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              )}
            </div>
        </div>
    </section>
  );
};