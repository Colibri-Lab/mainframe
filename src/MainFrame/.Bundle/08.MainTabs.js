App.Modules.MainFrame.MainTabs = class extends Colibri.UI.Tabs {
    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainTabs']);
        this.AddClass('app-main-tabs-component');
        this.handleResize = true;

        this._localStore = [];

        this.header.addEventListener('mousewheel', (e) => {
            this.header.scrollLeft += e.deltaY;
            return false;
        });
        this.RestoreFromLocalStore();

    }

    set width(value) {
        super.width = value;
        this.header.css('width', (super.width - this.links.bounds().outerWidth) + 'px');
    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SearchButtonClicked', false, 'Когда нажата кнопка поиска');
        
    }

    _createTabButton(title, route, icon, containerComponent) {
        const tabButton = new App.Modules.MainFrame.MainTabs.Button(route.replaceAll('/', '_'), this.header);
        tabButton.value = title;
        tabButton.closable = true;
        tabButton.parent = this;
        tabButton.icon = icon;
        tabButton.tag = {title: title, route: route, icon: icon, container: containerComponent};
        tabButton.AddHandler('MouseUp', (event, args) => {
            if(args.domEvent.button === 1 && tabButton.closable) {
                tabButton.Dispatch('CloseClicked', args);
            }
        });
        tabButton.AddHandler('CloseClicked', (event, args) => {

            this.RemoveFromLocalStore(route);

            const currentIndex = tabButton.container.index();

            tabButton.Dispose();
            containerComponent.Dispose();

            if(currentIndex == 0 && this.tabsCount > 0) {
                this.selectedIndex = 0;
            }
            else if(currentIndex > 0) {
                this.selectedIndex = currentIndex - 1;
            }
            else {
                this.Dispatch('SelectionChanged', {domEvent: args.domEvent, name: null}); 
            }

            args.domEvent.stopPropagation();
            args.domEvent.preventDefault();
            return false;
        });

        this.Dispatch('TabClicked', {tab: tabButton});
        tabButton.Redirect = (route) => {
            this.ReplaceInLocalStore(tabButton.tag.route, route);
            tabButton.tag.route = route;
            this.Dispatch('SelectionChanged', {tab: tabButton}); 
        };
        return tabButton;
    }
    
    AddTab(title, route, icon, containerComponent) {
        const tabName = route.replaceAll('/', '_');
        let tabButton = this.Children(tabName); 
        if(tabButton) {
            this.selectedTab = tabName;
        }
        else {
            const container = new containerComponent(tabName + '_container', this.container);
            tabButton = this._createTabButton(title, route, icon, container);
            container.tab = tabButton;
            this.Children(tabButton.name, tabButton, undefined, this.header);
            this.Children(container.name, container);
            this.header.scrollLeft = tabButton.container.bounds().left - this.links.bounds().outerWidth;
            this.selectedIndex = this.tabsCount - 1;

            this.SaveToLocalStore(route);

        }

    }

    RemoveFromLocalStore(route) {
        const index = this._localStore.indexOf(route);
        this._localStore.splice(index, 1);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    ReplaceInLocalStore(route1, route2) {

        const index = this._localStore.indexOf(route1);
        if(index === -1) {
            return;
        }
    
        this._localStore.splice(index, 1, route2);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    SaveToLocalStore(route) {
        const index = this._localStore.indexOf(route);
        if(index !== -1) {
            return;
        }
    
        this._localStore.push(route);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    RestoreFromLocalStore() {
        this._localStore = JSON.parse(window.localStorage.getItem('open-tabs'));
        if(!Array.isArray(this._localStore)) {
            this._localStore = [];
        }
    }

    get savedTabs() {
        return this._localStore;
    }

}

App.Modules.MainFrame.MainTabs.Button = class extends Colibri.UI.Button {

    constructor(name, container) {
        super(name, container);
        this.AddClass('app-tab-button-component');

        this._iconObject = new Colibri.UI.Icon(this.name + '-icon', this);
        this._textObject = new Colibri.UI.TextSpan(this.name + '-text', this);
        this._closeObject = new Colibri.UI.Icon(this.name + '-close', this);
        this._closeObject.value = Colibri.UI.CloseIcon;

        this._iconObject.shown = this._textObject.shown = this._closeObject.shown = true;

        this._color = null;

        this._closeObject.AddHandler('Clicked', (event, args) => this.Dispatch('CloseClicked', {domEvent: args.domEvent}));

    }

    /** @protected */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('CloseClicked', false, 'When clicked on close button');
    }

    get text() {
        return this._textObject;
    }

    get closable() {
        return this._closeObject.shown;
    }

    set closable(value) {
        this._closeObject.shown = value;
    }

    set icon(value) {
        this._iconObject.value = value;
    }

    get icon() {
        return this._iconObject.icon;
    }

    /**
     * Icon object name
     * @type {string}
     */
    get iconSVG() {
        return this._iconObject.iconSVG;
    }
    /**
     * Icon object name
     * @type {string}
     */
    set iconSVG(value) {
        this._iconObject.iconSVG = value;
    }

    get value() {
        return this._textObject.value;
    }

    set value(value) {
        this._textObject.value = value;
    }

}