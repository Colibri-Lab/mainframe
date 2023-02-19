App.Modules.MainFrame.Dashboard = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Dashboard']);
        this.AddClass('app-modules-mainframe-dashboard');

        this._container = this.Children('container');
        this._loadWidgets();

    }

    _loadWidgets() {

        const widgets = [];
        Object.forEach(App.Modules, (name, module) => {
            try {
                const moduleWidgets = eval('App.Modules.' + name + '.Widgets');
                Object.forEach(moduleWidgets, (name, widget) => {
                    if(typeof widget.Params == 'function') {
                        widgets.push(widget);
                    }
                });
            }
            catch(e) {

            }
        });

        widgets.sort((a, b) => {
            if(a.Params().defaultIndex > b.Params().defaultIndex) {
                return 1;
            } else if(a.Params().defaultIndex < b.Params().defaultIndex) {
                return -1;
            } else {
                return 0;
            }
        });

        for(const widget of widgets) {
            const widgetInstance = new widget(widget.Params().name + '-widget', this._container);
            if(!(widgetInstance instanceof Colibri.UI.Widget)) {
                widgetInstance.Dispose();
            } else {
                widgetInstance.shown = true;
            }
        }

        

    }

}