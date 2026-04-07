'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { milestoneAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Target, Plus, Calendar, CheckCircle2, Clock, AlertCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  status: string;
  createdAt: string;
}

export function MilestoneTimeline({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', workspaceId],
    queryFn: async () => {
      const response = await milestoneAPI.getByWorkspace(workspaceId);
      return response.data;
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: any) => {
      return await milestoneAPI.create({ ...data, workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', workspaceId] });
      setIsCreateModalOpen(false);
      setNewMilestone({ title: '', description: '', targetDate: '' });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await milestoneAPI.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', workspaceId] });
      setEditingMilestone(null);
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: string) => {
      return await milestoneAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', workspaceId] });
      setDeletingMilestone(null);
    },
  });

  const handleCreateMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.targetDate) {
      createMilestoneMutation.mutate(newMilestone);
    }
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateMilestoneMutation.mutate({ id, data: { status: newStatus } });
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone({
      title: milestone.title,
      description: milestone.description || '',
      targetDate: milestone.targetDate.split('T')[0],
    });
    setOpenMenuId(null);
  };

  const handleUpdateMilestone = () => {
    if (editingMilestone && newMilestone.title.trim() && newMilestone.targetDate) {
      updateMilestoneMutation.mutate({ id: editingMilestone.id, data: newMilestone });
    }
  };

  const handleDeleteMilestone = () => {
    if (deletingMilestone) {
      deleteMilestoneMutation.mutate(deletingMilestone.id);
    }
  };

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.status === 'completed') {
      return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' };
    }
    const targetDate = new Date(milestone.targetDate);
    const now = new Date();
    if (targetDate < now) {
      return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' };
    }
    return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading milestones...</div>
      </div>
    );
  }

  const sortedMilestones = [...(milestones || [])].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            {milestones?.length || 0} total milestones
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Milestone
        </Button>
      </div>

      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No milestones yet</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Your First Milestone
              </Button>
            </div>
          </Card>
        ) : (
          sortedMilestones.map((milestone) => {
            const status = getMilestoneStatus(milestone);
            const StatusIcon = status.icon;
            
            return (
              <Card key={milestone.id} className="hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className={`p-2 ${status.bg} rounded-lg flex-shrink-0`}>
                    <StatusIcon className={`w-6 h-6 ${status.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{milestone.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-medium whitespace-nowrap`}>
                          {status.label}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === milestone.id ? null : milestone.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>
                          {openMenuId === milestone.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button
                                  onClick={() => handleEditMilestone(milestone)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingMilestone(milestone);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Target: {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={milestone.status === 'completed' ? 'outline' : 'primary'}
                        onClick={() => handleStatusToggle(milestone.id, milestone.status)}
                      >
                        {milestone.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewMilestone({ title: '', description: '', targetDate: '' });
        }}
        title="Create New Milestone"
      >
        <div className="space-y-4">
          <Input
            label="Milestone Title"
            value={newMilestone.title}
            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            placeholder="e.g., Launch MVP, Reach 1000 users"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              placeholder="Describe what this milestone represents"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={newMilestone.targetDate}
            onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateMilestone}
              loading={createMilestoneMutation.isPending}
              fullWidth
            >
              Create Milestone
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewMilestone({ title: '', description: '', targetDate: '' });
              }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingMilestone}
        onClose={() => {
          setEditingMilestone(null);
          setNewMilestone({ title: '', description: '', targetDate: '' });
        }}
        title="Edit Milestone"
      >
        <div className="space-y-4">
          <Input
            label="Milestone Title"
            value={newMilestone.title}
            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            placeholder="e.g., Launch MVP, Reach 1000 users"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              placeholder="Describe what this milestone represents"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <Input
            label="Target Date"
            type="date"
            value={newMilestone.targetDate}
            onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateMilestone}
              loading={updateMilestoneMutation.isPending}
              fullWidth
            >
              Update Milestone
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingMilestone(null);
                setNewMilestone({ title: '', description: '', targetDate: '' });
              }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        title="Delete Milestone"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the milestone "{deletingMilestone?.title}"? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDeleteMilestone}
              loading={deleteMilestoneMutation.isPending}
              variant="primary"
              fullWidth
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeletingMilestone(null)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
