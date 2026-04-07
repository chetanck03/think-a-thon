'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, User, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: {
    name: string;
  };
}

export function TaskBoard({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      const response = await taskAPI.getByWorkspace(workspaceId);
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await taskAPI.create({ ...taskData, workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await taskAPI.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await taskAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setDeletingTask(null);
    },
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks?.filter((task: Task) => task.status === status) || [];
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
    setOpenMenuId(null);
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.title.trim()) {
      updateTaskMutation.mutate({ id: editingTask.id, data: newTask });
    }
  };

  const handleDeleteTask = () => {
    if (deletingTask) {
      deleteTaskMutation.mutate(deletingTask.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            {tasks?.length || 0} total tasks
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id}>
              <div className={`${column.color} rounded-lg p-3 mb-4`}>
                <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                  {column.title}
                  <span className="text-sm font-normal text-gray-600">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task: Task) => (
                    <div key={task.id} className="relative">
                      <Card className="p-4 hover:shadow-md transition h-[280px] flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{task.title}</h4>
                          </div>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                            className="p-1 hover:bg-gray-100 rounded-md transition ml-2 flex-shrink-0"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {task.priority && (
                                <span
                                  className={`px-2 py-1 rounded-full font-medium ${
                                    task.priority === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : task.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </div>

                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {task.assignee && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              <span>{task.assignee.name}</span>
                            </div>
                          )}

                          <button
                            onClick={() => setViewingTask(task)}
                            className="w-full py-2 px-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-2 border border-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="w-full text-xs px-2 py-1 border border-gray-200 rounded bg-white text-gray-700"
                          >
                            {columns.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </Card>

                      {openMenuId === task.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-2 top-12 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Task
                            </button>
                            <button
                              onClick={() => {
                                setDeletingTask(task);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Task
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Enter task title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateTask}
              loading={createTaskMutation.isPending}
              fullWidth
            >
              Create Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
        >
          <div className="space-y-4">
            <Input
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <Input
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateTask}
                loading={updateTaskMutation.isPending}
                fullWidth
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingTask(null)}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <Modal
          isOpen={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          title="Delete Task"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{deletingTask.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingTask(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTask}
                loading={deleteTaskMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Task Details Modal */}
      {viewingTask && (
        <Modal
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          title="Task Details"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{viewingTask.title}</h3>
              {viewingTask.description && (
                <p className="text-gray-600">{viewingTask.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="capitalize text-gray-900">{viewingTask.status.replace('-', ' ')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingTask.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : viewingTask.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {viewingTask.priority}
                  </span>
                </div>
              </div>

              {viewingTask.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {new Date(viewingTask.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}

              {viewingTask.assignee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{viewingTask.assignee.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setViewingTask(null);
                  handleEditTask(viewingTask);
                }}
                variant="outline"
                fullWidth
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </Button>
              <Button
                onClick={() => setViewingTask(null)}
                fullWidth
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
