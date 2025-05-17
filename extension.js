import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Meta from 'gi://Meta';

export default class PrimaryWindowsExtension extends Extension {
    enable() {
        this._windowCreatedId = global.display.connect('window-created', this._onWindowCreated.bind(this));
    }

    disable() {
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }
    }

    _onWindowCreated(display, window) {
        try {
            const windowTitle = window.get_title();
            const primaryMonitor = display.get_primary_monitor();
            const currentMonitor = window.get_monitor();

            if (currentMonitor === primaryMonitor) {
                return;
            }

            const windowType = window.get_window_type();
            const normalWindowType = Meta.WindowType.NORMAL;

            if (windowType !== normalWindowType) {
                log(`PrimaryWindowsExtension: Window "${windowTitle}" is not a normal window (type: ${windowType}), not moving.`);
                return;
            }

            const windowActor = window.get_compositor_private();
            if (!windowActor || !windowActor.get_stage()) {
                log(`PrimaryWindowsExtension: Window "${windowTitle}" has no actor or stage, not moving.`);
                return;
            }

            windowActor.connect('first-frame', () => {
                try {
                    log(`PrimaryWindowsExtension: Moving window "${windowTitle}" from monitor ${currentMonitor} to ${primaryMonitor}`);
                    window.move_to_monitor(primaryMonitor);
                } catch (e) {
                    logError(`PrimaryWindowsExtension: Error moving window "${windowTitle}": ${e.message}`);
                }
            });
        } catch (e) {
            logError(`PrimaryWindowsExtension: Error handling new window: ${e.message}`);
        }
    }
}