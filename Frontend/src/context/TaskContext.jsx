import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks,   setTasks]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.getTasks(params);
      setTasks(res.data.data);
    } catch (e) {
      toast.error('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getTaskStats();
      setStats(res.data.data);
    } catch {}
  }, []);

  const addTask = useCallback(async (data) => {
    const res = await api.createTask(data);
    setTasks(prev => [res.data.data, ...prev]);
    setStats(prev => prev ? {
      ...prev,
      total: prev.total + 1,
      byStatus: { ...prev.byStatus, [data.status || 'todo']: (prev.byStatus[data.status || 'todo'] || 0) + 1 },
    } : prev);
    toast.success('Task created!');
    return res.data.data;
  }, []);

  const editTask = useCallback(async (id, data) => {
    const res = await api.updateTask(id, data);
    setTasks(prev => prev.map(t => t._id === id ? res.data.data : t));
    toast.success('Task updated!');
    return res.data.data;
  }, []);

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t._id !== id));
    setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
    toast.success('Task deleted.');
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, stats, loading, fetchTasks, fetchStats, addTask, editTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);