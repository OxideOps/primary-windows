import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

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
            if (!window) {
                logError(`PrimaryWindowsExtension: Null window created: ${window}`);
                return;
            }

            const windowTitle = window.get_title();
            const primaryMonitor = display.get_primary_monitor();
            const currentMonitor = window.get_monitor();

            if (currentMonitor !== primaryMonitor) {
                log(`PrimaryWindowsExtension: Moving window ${windowTitle} to primary monitor ${primaryMonitor}`);
                window.move_to_monitor(primaryMonitor);
            }
        } catch (e) {
            logError(`PrimaryWindowsExtension: Error handling new window: ${e.message}`);
        }
    }
}
