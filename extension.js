import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GLib from 'gi://GLib';

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

            if (currentMonitor !== primaryMonitor) {
                log(`PrimaryWindowsExtension: Moving window ${windowTitle} to primary monitor ${primaryMonitor}`);
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
                    window.move_to_monitor(primaryMonitor);
                    return GLib.SOURCE_REMOVE;
                });
            }
        } catch (e) {
            logError(`PrimaryWindowsExtension: Error handling new window: ${e.message}`);
        }
    }
}
