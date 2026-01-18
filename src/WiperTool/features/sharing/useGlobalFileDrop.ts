import { FailureTypes, isImportableWipingSequenceFile } from 'WiperTool/domain/imports';
import { actionFileDroppedEvent, actionImportModalOpenedEvent, track } from 'WiperTool/lib/analytics';
import { useImports, useModals } from 'WiperTool/providers/AppModelProvider';
import { ModalKeys } from 'WiperTool/ui/modals';
import { createSignal, onCleanup, onMount } from 'solid-js';

const [isDroppingFile, setIsDroppingFile] = createSignal(false);
export { isDroppingFile };

const setDragClass = (isDragging: boolean) => {
  const root = document.documentElement;
  root.classList.toggle('before:inset-ring-4', isDragging);
  root.classList.toggle('before:inset-ring-emerald-400/50', isDragging);
};

function isFileDragEvent(event: DragEvent) {
  return Boolean(event.dataTransfer?.types?.includes('Files'));
}

function isImportableFileDragEvent(event: DragEvent) {
  return (
    event.dataTransfer?.types?.includes('application/json') ||
    Array.from(event.dataTransfer?.items ?? []).some((item) => item.type === 'application/json')
  );
}

function getDragFiles(event: DragEvent): File[] {
  if (!isFileDragEvent(event)) {
    return [];
  }
  return Array.from(event.dataTransfer?.files ?? []);
}

export function useGlobalFileDrop() {
  const imports = useImports();
  const modals = useModals();

  let dragCounter = 0;

  const handleDrop = (event: DragEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    const files = getDragFiles(event);
    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragCounter = 0;
    setIsDroppingFile(false);
    setDragClass(false);

    track(actionFileDroppedEvent(files[0].type));

    const importableFile = files.find(isImportableWipingSequenceFile);
    if (importableFile) {
      if (!modals.isModalOpen(ModalKeys.ImportWipingSequence)) {
        track(actionImportModalOpenedEvent('global_drop'));
        modals.actions.openModal(ModalKeys.ImportWipingSequence);
      }
      imports.actions.importWipingSequenceFile(importableFile);
      return;
    }

    if (modals.isModalOpen(ModalKeys.ImportWipingSequence)) {
      imports.actions.setWipingSequenceImportFailure(FailureTypes.UnsupportedFileType);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    if (!isFileDragEvent(event)) {
      return;
    }

    if (!event.defaultPrevented) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleDragEnter = (event: DragEvent) => {
    if (!isFileDragEvent(event)) {
      return;
    }

    dragCounter += 1;
    setIsDroppingFile(true);
    if (isImportableFileDragEvent(event)) {
      setDragClass(true);
    }
  };

  const handleDragLeave = (event: DragEvent) => {
    if (!isFileDragEvent(event)) {
      return;
    }

    dragCounter = Math.max(0, dragCounter - 1);
    if (dragCounter === 0) {
      setIsDroppingFile(false);
      setDragClass(false);
    }
  };

  onMount(() => {
    window.document.body.addEventListener('dragover', handleDragOver, { capture: true });
    window.document.body.addEventListener('drop', handleDrop, { capture: true });
    window.document.body.addEventListener('dragenter', handleDragEnter, { capture: true });
    window.document.body.addEventListener('dragleave', handleDragLeave, { capture: true });
  });

  onCleanup(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.document.body.removeEventListener('dragover', handleDragOver, { capture: true });
    window.document.body.removeEventListener('drop', handleDrop, { capture: true });
    window.document.body.removeEventListener('dragenter', handleDragEnter, { capture: true });
    window.document.body.removeEventListener('dragleave', handleDragLeave, { capture: true });
  });
}
