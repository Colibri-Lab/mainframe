App.Modules.MainFrame.Widgets.ServerStatistics = class extends Colibri.UI.Widget {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.ServerStatistics']);
        this.AddClass('app-modules-mainframe-widgets-serverstatistics');

        this.title = '#{mainframe-widgets-serverstatistics-title}';
        this.closable = false;
        
        this._mainfields = this.Children('split/mainfields');
        this._processes = this.Children('split/processes');

        this.binding = 'app.mainframe.status';


    }

    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        data = data.server ?? {};
        if(!data || Object.countKeys(data) === 0) {
            return;
        }
        this._mainfields.value = data;
        const chartsData = [
            ['Name', 'Count'],
            ['Ожидание',      data['connections_waiting']],
            ['Чтение',      data['connections_writing']],
            ['Запись',      data['connections_reading']],
            ['Активные',     data['connections_active']],
        ];

        this._processes.value = chartsData;

    }
    
    static Params() {
        return {
            defaultIndex: 0,
            name: 'server-stats'        
        }
    }

}

MainFrame.RegisterWidget('server-stats', App.Modules.MainFrame.Widgets.ServerStatistics);