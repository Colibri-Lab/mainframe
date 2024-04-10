App.Modules.MainFrame.Widgets.FpmStatistics = class extends Colibri.UI.Widget {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.FpmStatistics']);
        this.AddClass('app-modules-mainframe-widgets-fpmstatistics');

        this.title = '#{mainframe-widgets-fpmstatistics-title}';  
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
        data = data.fpm ?? {};
        if(!data || Object.countKeys(data) === 0) {
            return;
        }
        this._mainfields.value = data;
        const chartsData = [
            ['Name', 'Count'],
            ['Ждут работы',     data['idle-processes']],
            ['Работают',      data['active-processes']],
        ];

        this._processes.value = chartsData;

    }

    static Params() {
        return {
            defaultIndex: 1,
            name: 'fpm-stats'
        }
    }

}

MainFrame && MainFrame.RegisterWidget('fpm-stats', App.Modules.MainFrame.Widgets.FpmStatistics);
