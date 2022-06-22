App.Modules.MainFrame.MainPage = class extends Colibri.UI.Component {

    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainPage']);

        this.AddClass('app-main-page-component');

        this._split = this.Children('split');
        this._menu = this.Children('split/left-pane/expanded/menu');
        this._expanded = this.Children('split/left-pane/expanded');
        this._toolbar = this.Children('split/left-pane/collapsed');
        this._user = this.Children('split/left-pane/expanded/user');
        this._tabs = this.Children('split/main-tabs');

        // <Icon name="search-button" shown="true" iconSVG="Colibri.UI.SearchIcon" />
        // this._searchButton = this._tabs.Children('search-button');
        this._toolbarButtonExpand = this._tabs.Children('toolbar-button-expand');
        this._toolbarButtonCollapse = this._tabs.Children('toolbar-button-collapse');

        this._menu.AddHandler('SelectionChanged', (event, args) => this.__menuSelectionChanged(event, args));
        this._toolbar.AddHandler('ToolbarButtonClicked', (event, args) => this.__toolbarButtonClicked(event, args));
        this._user.AddHandler('LogoutClicked', (event, args) => this.__logoutClicked(event, args));
        this._user.AddHandler('ProfileClicked', (event, args) => this.__profileClicked(event, args));
        this._split.AddHandler(['SplitResizing', 'Resize'], (event, args) => this.__splitResizing(event, args));
        this._menu.AddHandler('NodesLoaded', (event, args) => this.__nodesLoaded(event, args));
        this._tabs.AddHandler('SelectionChanged', (event, args) => this.__tabsClicked(event, args));

        // this._searchButton.AddHandler('Clicked', (event, args) => this.__searchButtonClicked(event, args));
        this._toolbarButtonExpand.AddHandler('Clicked', (event, args) => this.__toolbarExpandButtonClicked(event, args));
        this._toolbarButtonCollapse.AddHandler('Clicked', (event, args) => this.__toolbarCollapseButtonClicked(event, args));

        Colibri.Common.Delay(100).then(() => {
            this._tabs.width = this._split.width - this._split.leftWidth;
        });

        const maintabsStatus = window.localStorage.getItem('maintabs');
        if(maintabsStatus === 'toolbar') {
            this.__toolbarCollapseButtonClicked(null, null);
        }
        else {
            this.__toolbarExpandButtonClicked(null, null);
        }

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

    // __searchButtonClicked(event, args) {

    // }

    __toolbarExpandButtonClicked(event, args) {
        this._toolbarButtonCollapse.shown = true;
        this._toolbarButtonExpand.shown = false;
        this._split.hasHandle = true;
        this._split.leftWidth = '15%';
        this._toolbar.shown = false;
        this._expanded.shown = true;
        this._tabs.width = this._split.width - this._split.leftWidth;
        window.localStorage.setItem('maintabs', 'tree');
    }

    __toolbarCollapseButtonClicked(event, args) {
        this._toolbarButtonCollapse.shown = false;
        this._toolbarButtonExpand.shown = true;
        this._split.hasHandle = false;
        this._split.leftWidth = '40px';
        this._toolbar.shown = true;
        this._expanded.shown = false;
        this._tabs.width = this._split.width - this._split.leftWidth;
        window.localStorage.setItem('maintabs', 'toolbar');
    }

    __menuSelectionChanged(event, args) {
        const node = args.node;
        if(!node) {
            return;
        }

        const menuItem = node?.tag;
        MainFrame.OpenTab(menuItem.title, menuItem.index, eval(menuItem.icon), eval(menuItem.execute));
        
    }

    __toolbarButtonClicked(event, args) {
        const button = args.button;
        if(!button) {
            return;
        }

        const menuItem = button?.tag;
        if(!menuItem) {
            Security.ShowProfileWindow();
        }
        else {
            MainFrame.OpenTab(menuItem.title, menuItem.index, eval(menuItem.icon), eval(menuItem.execute));
        }
    }

    __logoutClicked(event, args) {
        Security.Logout();
    }

    __profileClicked(event, args) {
        Security.ShowProfileWindow();
    }

    __splitResizing(event, args) {
        this._tabs.width = this._split.width - this._split.leftWidth;
    }

    __nodesLoaded(event, args) {
        for(const route of this._tabs.savedTabs) {
            for(const node of this._menu.allNodes) {
                let check = route;
                if(route.indexOf('?') !== -1) {
                    check = check.split('?')[0];
                }
                if(node.tag.index === check) {
                    MainFrame.OpenTab(node.tag.title, route, eval(node.tag.icon), eval(node.tag.execute));
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