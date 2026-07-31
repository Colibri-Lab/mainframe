/**
 * FPM processes list item component
 * @class
 * @extends Colibri.UI.Pane
 * @memberof App.Modules.MainFrame.Widgets
 */
App.Modules.MainFrame.Widgets.FpmProcessesListItem = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.FpmProcessesListItem']);
        this.AddClass('app-modules-mainframe-widgets-fpmprocesseslistitem');

        this._mainfields = this.Children('mainfields');

    }

    /**
     * Value object
     * @type {object}
     */
    get value() {
        return this._mainfields.value;
    }
    /**
     * Value object
     * @type {object}
     */
    set value(value) {
        this._mainfields.value = value;
    }

}