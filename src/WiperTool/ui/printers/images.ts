import type { PrinterKey } from '@/WiperTool/domain/printers';
import { PrinterKeys } from '@/WiperTool/domain/printers';
import prusaCoreOneThumbnail from './assets/COREONE_thumbnail.png?url';
import prusaCoreOneLThumbnail from './assets/COREONEL_thumbnail.png?url';
import prusaMk4Thumbnail from './assets/MK4_thumbnail.png?url';
import prusaXlThumbnail from './assets/XL5_thumbnail.png?url';

export const printerThumbnails: Record<PrinterKey, string> = {
  [PrinterKeys.PrusaCoreOne]: prusaCoreOneThumbnail,
  [PrinterKeys.PrusaCoreOneL]: prusaCoreOneLThumbnail,
  [PrinterKeys.PrusaMk4]: prusaMk4Thumbnail,
  [PrinterKeys.PrusaXl]: prusaXlThumbnail,
};
