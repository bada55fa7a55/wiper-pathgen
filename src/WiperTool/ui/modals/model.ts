export const ModalKeys = {
  Share: 'share',
  ShareLink: 'share-link',
  ImportWipingSequence: 'import-wiping-sequence',
  ImportSharedWipingSequence: 'import-shared-wiping-sequence',
} as const;

export type ModalKey = (typeof ModalKeys)[keyof typeof ModalKeys];
