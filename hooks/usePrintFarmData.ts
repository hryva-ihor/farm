import { useState, useEffect, useMemo } from 'react';
import { PrintFarmData, Detail, RoomAllocation, AppError } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const getSampleData = (): PrintFarmData => ({
  details: [
    { id: "d1", name: "Деталь 1", plan: 100 },
    { id: "d2", name: "Деталь 2", plan: 200 }
  ],
  allocations: [
    { id: "a1", room: "четвірка", detail_id: "d1", printers: 30, started: 10 },
    { id: "a2", room: "курілка", detail_id: "d2", printers: 40, started: 0 }
  ]
});

export const usePrintFarmData = () => {
  const [data, setData] = useState<PrintFarmData>({ details: [], allocations: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seedInitialData = async () => {
        const detailsCollection = collection(db, 'details');
        const snapshot = await getDocs(detailsCollection);
        if (snapshot.empty) {
            console.log("База даних порожня. Заповнення початковими даними...");
            const sampleData = getSampleData();
            const batch = writeBatch(db);
            sampleData.details.forEach(detail => {
                const docRef = doc(detailsCollection, detail.id);
                batch.set(docRef, { name: detail.name, plan: detail.plan });
            });
            sampleData.allocations.forEach(alloc => {
                const docRef = doc(collection(db, 'allocations'), alloc.id);
                batch.set(docRef, { room: alloc.room, detail_id: alloc.detail_id, printers: alloc.printers, started: alloc.started });
            });
            await batch.commit();
        }
    };

    seedInitialData().then(() => {
        const detailsUnsubscribe = onSnapshot(collection(db, 'details'), 
            (snapshot) => {
                const details = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Detail));
                setData(prevData => ({ ...prevData, details }));
                setLoading(false);
            }, 
            (err) => {
                setError(`Помилка завантаження деталей: ${err.message}`);
                setLoading(false);
            }
        );

        const allocationsUnsubscribe = onSnapshot(collection(db, 'allocations'), 
            (snapshot) => {
                const allocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomAllocation));
                setData(prevData => ({ ...prevData, allocations }));
            }, 
            (err) => {
                setError(`Помилка завантаження розподілів: ${err.message}`);
            }
        );

        // Cleanup subscriptions on unmount
        return () => {
            detailsUnsubscribe();
            allocationsUnsubscribe();
        };
    }).catch(err => {
        setError(`Помилка ініціалізації даних: ${(err as Error).message}`);
        setLoading(false);
    });
  }, []);
  
  const detailNameHistory = useMemo(() => {
    const names = data.details.map(d => d.name);
    return [...new Set(names)];
  }, [data.details]);

  const handleError = (e: unknown, context: string) => {
      const err = e as Error;
      const appError: AppError = { error: `Не вдалося ${context}`, context: err.message };
      setError(appError.error);
      console.error(appError);
  }

  const addDetail = async (detail: Omit<Detail, 'id'>) => {
    if (!detail.name || detail.plan <= 0) {
      setError("Некоректні дані: Назва та план повинні бути заповнені, а план - бути позитивним числом.");
      return;
    }
    try {
      await addDoc(collection(db, 'details'), detail);
    } catch (e) {
      handleError(e, 'додати деталь');
    }
  };

  const updateDetail = async (updatedDetail: Detail) => {
     if (!updatedDetail.name || updatedDetail.plan <= 0) {
      setError("Некоректні дані: Назва та план повинні бути заповнені, а план - бути позитивним числом.");
      return;
    }
    try {
      const detailRef = doc(db, 'details', updatedDetail.id);
      const { id, ...dataToUpdate } = updatedDetail;
      await updateDoc(detailRef, dataToUpdate);
    } catch (e) {
        handleError(e, 'оновити деталь');
    }
  };

  const deleteDetail = async (detailId: string) => {
    try {
      const batch = writeBatch(db);
      
      // Delete the detail itself
      const detailRef = doc(db, 'details', detailId);
      batch.delete(detailRef);
      
      // Find and delete associated allocations
      const allocationsQuery = query(collection(db, 'allocations'), where('detail_id', '==', detailId));
      const allocationsSnapshot = await getDocs(allocationsQuery);
      allocationsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
    } catch (e) {
        handleError(e, 'видалити деталь');
    }
  };

  const addRoomAllocation = async (allocation: Omit<RoomAllocation, 'id' | 'started'>) => {
    try {
      const newAllocation = { ...allocation, started: 0 };
      await addDoc(collection(db, 'allocations'), newAllocation);
    } catch (e) {
      handleError(e, 'додати завдання');
    }
  };

  const updateRoomAllocation = async (updatedAllocation: RoomAllocation) => {
    try {
        const allocationRef = doc(db, 'allocations', updatedAllocation.id);
        const { id, ...dataToUpdate } = updatedAllocation;
        await updateDoc(allocationRef, dataToUpdate);
    } catch (e) {
        handleError(e, 'оновити завдання');
    }
  };
  
  const deleteRoomAllocation = async (allocationId: string) => {
    try {
        await deleteDoc(doc(db, 'allocations', allocationId));
    } catch (e) {
        handleError(e, 'видалити завдання');
    }
  };

  return {
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
  };
};