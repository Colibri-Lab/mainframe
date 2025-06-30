App.Modules.MainFrame.Dashboard = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Dashboard']);
        this.AddClass('app-modules-mainframe-dashboard');

        this._container = this.Children('container');
        const draggable = this._loadWidgets();

        this._dragManager = new Colibri.UI.DragManager(draggable, [this._container]);
        this._dragManager.AddHandler('DragDropComplete', this.__dragDropComplete, false, this);
        this._dragManager.AddHandler('DragDropOver', this.__dragDropOver, false, this);
        this._dragManager.AddHandler('DragDropLeave', this.__dragDropLeave, false, this);

    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragDropLeave(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {
            // const droppedToWidget = widgetElement.getUIComponent();
            const droppedToWidget = widgetElement.getUIComponent();
            droppedToWidget.RemoveClass('drag-over')
        }
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragDropOver(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {
            // const droppedToWidget = widgetElement.getUIComponent();
            const droppedToWidget = widgetElement.getUIComponent();
            droppedTo.ForEach((name, component) => component.RemoveClass('drag-over'));
            droppedToWidget.AddClass('drag-over');
        }    
    }

    /**
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */ 
    __dragDropComplete(event, args) {
        const dragged = args.dragged;
        const droppedTo = args.droppedTo;
        const droppedToElement = args.droppedToElement;
        
        const widgetElement = droppedToElement.closest('.app-component-widget');
        if(widgetElement) {

            // const droppedToWidget = widgetElement.getUIComponent();
            const droppedToWidget = widgetElement.getUIComponent();
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
        Object.forEach(MainFrame.registeredWidgets, (name, widget) => {
            try {
                if(typeof widget.Params == 'function') {
                    widgets.push(widget);
                }
            }
            catch(e) { }
        });

        let positions = App.Browser.Get('dashboard-widgets');
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
            positions = positions.split(',');
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