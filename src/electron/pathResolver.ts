import path from 'path';
import { app } from 'electron';
import { isDev } from './util.js';

export function getPreloadPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        '/dist-electron/preload.cjs'
    );
}

export function getVideoPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        '/backend/Videos'
    );
}

export function getAssetsPath() {
    return path.join(
        app.getAppPath(),
        isDev() ? '.' : '..',
        '/src/ui/assets'
    );
}