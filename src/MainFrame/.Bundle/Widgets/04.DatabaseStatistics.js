App.Modules.MainFrame.Widgets.DatabaseStatistics = class extends Colibri.UI.Widget {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.DatabaseStatistics']);
        this.AddClass('app-modules-mainframe-widgets-databasestatistics');

        this.title = '#{mainframe-widgets-databasesstatistics-title}';
        this.closable = false;
        this.colspan = 3;

        this._mainfields = this.Children('mainfields');

        this.binding = 'app.mainframe.status';

    }

    __renderBoundedValues(data, path) {
        data = data.databases ?? [];
        if(!data || data.length === 0) {
            return;
        }

        this._mainfields.value = data[0];
        
    }

    static Params() {
        return {
            defaultIndex: 3,
            name: 'database-stats'
        }
    }
}