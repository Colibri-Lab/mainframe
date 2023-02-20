App.Modules.MainFrame.Widgets.StatsChart = class extends Colibri.UI.Widget {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Widgets.StatsChart']);
        this.AddClass('app-modules-mainframe-widgets-statschart');

        this.title = '#{mainframe-widgets-statschart-title}';
        this.closable = false;
        this.colspan = 3;

        this._processes = this.Children('processes');

        this.binding = 'app.mainframe.status;app.mainframe.graph';


    }

    __renderBoundedValues(data, path) {
        if(path.indexOf('mainframe.graph') !== -1) {
            if(!Array.isArray(data) || data.length === 0) {
                return;
            }

            let value = [
                ['Date', 'Databases', 'Fpm', 'Server'],
            ];
            for(const o of data) {
                try { value.push([o.time.toDateFromUnixTime(), o.databases[0].open_files, o.fpm['active-processes'], o.server.connections_active]); } catch(e) {}
            }
            console.log(value);
            this._processes.value = value;

        } else if(path.indexOf('mainframe.status') !== -1) {
            let graph = MainFrame.Store.Query('mainframe.graph');
            if(!Array.isArray(graph)) {
                graph = [];
            }
            graph.push({time: parseInt(Date.Now().getTime() / 1000), fpm: data.fpm, server: data.server, databases: data.databases});
            MainFrame.Store.Set('mainframe.graph', graph);

        }

        
    }
    
    static Params() {
        return {
            defaultIndex: 4,
            name: 'stats-chart'
        }
    }
}

MainFrame.RegisterWidget('stats-chart', App.Modules.MainFrame.Widgets.StatsChart);