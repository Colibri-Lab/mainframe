App.Modules.MainFrame.MainPage = class extends Colibri.UI.Component {

    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainPage']);

        this.AddClass('app-main-page-component');

        this._split = this.Children('split');
        this._menu = this.Children('split/left-pane/menu');
        this._user = this.Children('split/left-pane/user');
        this._tabs = this.Children('split/main-tabs');

        this._menu.AddHandler('SelectionChanged', (event, args) => this.__menuSelectionChanged(event, args));
        this._user.AddHandler('LogoutClicked', (event, args) => this.__logoutClicked(event, args));
        this._split.AddHandler(['SplitResizing', 'Resize'], (event, args) => this.__splitResizing(event, args));
        this._menu.AddHandler('NodesLoaded', (event, args) => this.__nodesLoaded(event, args));
        this._tabs.AddHandler('SelectionChanged', (event, args) => this.__tabsClicked(event, args));

    }

    set user(value) {
        this._user.binding = value;   
    }

    get Tabs() {
        return this._tabs;
    }

    get Menu() {
        return this._menu;
    }

    __menuSelectionChanged(event, args) {
        const node = args.node;
        if(!node) {
            return;
        }

        const menuItem = node?.tag;
        
        MainFrame.OpenTab(menuItem.title, menuItem.index, eval(menuItem.icon), eval(menuItem.execute));

    }

    __logoutClicked(event, args) {
        Security.Logout();
    }

    __splitResizing(event, args) {
        this._tabs.width = this._split.width - this._split.leftWidth;
    }

    __nodesLoaded(event, args) {
        for(const route of this._tabs.savedTabs) {
            for(const node of this._menu.allNodes) {
                if(node.tag.index == route) {
                    MainFrame.OpenTab(node.tag.title, node.tag.index, eval(node.tag.icon), eval(node.tag.execute));
                    break;
                }
            };
        }
    }

    __tabsClicked(event, args) {
        if(!args.tab) {
            App.Router.Navigate('', {});
        }
        else {
            App.Router.Navigate(args.tab.tag.route, {});
        }
    }

}