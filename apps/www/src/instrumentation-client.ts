import { installDriveReporter } from '@/lib/drive-reporter';

if (process.env.PLATE_WWW_DRIVE) installDriveReporter();
