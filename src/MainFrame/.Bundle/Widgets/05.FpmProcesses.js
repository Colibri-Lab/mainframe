/**
 * FPM processes component
 * @class
 * @extends Colibri.UI.Widget
 * @memberof App.Modules.MainFrame.Widgets
 */
App.Modules.MainFrame.Widgets.FpmProcesses = class extends Colibri.UI.Widget {
    
    /**
     * Constructor
     * @param {string} name component name
     * @param {Colibri.UI.Component} container component container
     * @constructor
     */
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.FpmProcesses']);
        this.AddClass('app-modules-mainframe-widgets-fpmprocesses');

        this.title = '#{mainframe-widgets-fpmprocesses-title}';
        this.closable = false;

        this._processList = this.Children('process-list');
        this._processGroup = this.Children('process-list/process-group');

        this.binding = 'app.mainframe.status';

    }
 
    
    /**
     * Render bounded to component data
     * @protected
     * @param {*} data 
     * @param {String} path 
     */
    __renderBoundedValues(data, path) {
        data = data?.fpm ?? {};
        if(!data || Object.countKeys(data) === 0 || (data?.processes ?? []).length === 0) {
            return;
        }
        
        data.processes.sort((a, b) => {
            if(a['last-request-cpu'] * 1000000000 + a['last-request-memory'] > b['last-request-cpu'] * 1000000000 + b['last-request-memory']) {
                return -1;
            } else if(a['last-request-cpu'] * 1000000000 + a['last-request-memory'] < b['last-request-cpu'] * 1000000000 + b['last-request-memory']) {
                return 1;
            }
            return 0;
        });

        this._processGroup.Clear();
        for(const process of data.processes) {
            if(process['request-uri'].indexOf('fpmstatus') !== -1) {
                continue;
            }
            this._processGroup.AddItem(process);
        }

    }

    /**
     * Gets the default parameters for the widget
     * @static
     * @public
     */
    static Params() {
        return {
            defaultIndex: 2,
            name: 'fpm-processes'
        }
    }

}

MainFrame.RegisterWidget('fpm-processes', App.Modules.MainFrame.Widgets.FpmProcesses);