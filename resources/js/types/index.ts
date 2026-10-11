export type * from './auth';
export type * from './navigation';
export type * from './ui';

import { type Auth } from './auth';

export type SharedData = {
    auth: Auth;
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
};