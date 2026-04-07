'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export function CreateWorkspaceButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Workspace
      </Button>
      <CreateWorkspaceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
