App.Modules.MainFrame.Dashboard = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Dashboard']);
        this.AddClass('app-modules-mainframe-dashboard');

        this._container = this.Children('container');
        const draggable = this._loadWidgets();

        this._dragManager = new Colibri.UI.DragManager(draggable, [this._container]);
        this._dragManager.AddHandler('DragDropComplete', (event, args) => this.__dragDropComplete(event, args));
        this._dragManager.AddHandler('DragDropOver', (event, args) => this.__dragDropOver(event, args));
        this._dragManager.AddHandler('DragDropLeave', (event, args) => this.__dragDropLeave(event, args));

    }

    __dragDropLeave(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {
            const droppedToWidget = widgetElement.tag('component');
            droppedToWidget.RemoveClass('drag-over')
        }
    }

    __dragDropOver(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {
            const droppedToWidget = widgetElement.tag('component');
            droppedTo.ForEach((name, component) => component.RemoveClass('drag-over'));
            droppedToWidget.AddClass('drag-over');
            console.log(dragged, droppedTo, droppedToWidget);
        }    
    }

    __dragDropComplete(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {

            const droppedToWidget = widgetElement.tag('component');
            droppedToWidget.RemoveClass('drag-over');
            droppedTo.Children(dragged.name, dragged, droppedToWidget.index, droppedTo.container, dragged.mainElement);

            this._saveWidgetsPositions();

        }
    }

    _saveWidgetsPositions() {
        let positions = [];
        this._container.ForEach((name, widget) => {
            positions.push(name);
        });
        App.Browser.Set('dashboard-widgets', positions);
    }

    _loadWidgets() {

        let widgets = [];
        Object.forEach(App.Modules.MainFrame.RegisteredWidgets, (name, widget) => {
            try {
                console.log(name, widget);
                if(typeof widget.Params == 'function') {
                    widgets.push(widget);
                }
            }
            catch(e) { }
        });

        const positions = App.Browser.Get('dashboard-widgets').split(',');
        if(!positions) {

            widgets.sort((a, b) => {
                if(a.Params().defaultIndex > b.Params().defaultIndex) {
                    return 1;
                } else if(a.Params().defaultIndex < b.Params().defaultIndex) {
                    return -1;
                } else {
                    return 0;
                }
            });

        } else {

            const w = [];
            for(const name of positions) {
                for(const widget of widgets) {
                    if(widget.Params().name == name) {
                        w.push(widget);
                    }
                }
            }
            widgets = w;
        }


        const ret = [];
        for(const widget of widgets) {
            const widgetInstance = new widget(widget.Params().name, this._container);
            if(!(widgetInstance instanceof Colibri.UI.Widget)) {
                widgetInstance.Dispose();
            } else {
                widgetInstance.shown = true;
                ret.push(widgetInstance);
            }
        }

        return ret;

    }

}