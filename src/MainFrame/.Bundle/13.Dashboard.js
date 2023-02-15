App.Modules.MainFrame.Dashboard = class extends Colibri.UI.Pane {
    
    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.Dashboard']);
        this.AddClass('app-modules-mainframe-dashboard');


    }

}