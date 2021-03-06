((function () {
    'use strict';

    Modules.prototype.add('pane-types', function (instance) {

        instance.events.on('pane.split', function (oldPane, newPane) {
            var oldType = oldPane.attrData('pane-type');
            if (oldType) instance.pane.setType(newPane, oldType);
        });

        instance.pane.types = {};

        instance.pane.setType = function (pane, name) {
            if (this.types[name]) {
                var typeCallbacks = this.types[name];
                typeCallbacks.onPaneType(pane, instance);
                pane.dataset.paneType = name;
            }
        };
    }, ['pane']);
})());
