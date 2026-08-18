/**
 * Main tabs component
 * @class
 * @namespace
 * @extends Colibri.UI.Tabs
 * @memberof App.Modules.MainFrame
 */
App.Modules.MainFrame.MainTabs = class extends Colibri.UI.Tabs {

    /**
     * Constructor
     * @param {string} name component name
     * @param {Colibri.UI.Component} container component container
     * @param {HTMLElement} element component element
     * @constructor
     */
    constructor(name, container, element) {
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainTabs']);
        this.AddClass('app-main-tabs-component');
        this.handleResize = true;

        this._localStore = [];

        this.__handleMouseWheel = (e) => {
            this.header.scrollLeft += e.deltaY;
            return false;
        };

        this.header.addEventListener('mousewheel', this.__handleMouseWheel);
        this.RestoreFromLocalStore();

    }

    /**
     * Disposes the component
     * @public
     * @returns {void}
     */
    Dispose() {
        this.header.removeEventListener('mousewheel', this.__handleMouseWheel);
        super.Dispose();
    }

    /** 
     * Component width
     * @type {number}
     */
    get width() {
        return super.width
    }

    /** 
     * Component width
     * @type {number}
     */
    set width(value) {
        super.width = value;
        this.header.css('width', (super.width - this.links.bounds().outerWidth) + 'px');
    }

    /** 
     * @ignore
     * @protected
     */
    _registerEvents() {
        super._registerEvents();
        this.RegisterEvent('SearchButtonClicked', false, 'Когда нажата кнопка поиска');

    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __tabButtonMouseUp(event, args) {
        if (args.domEvent.button === 1 && event.sender.closable) {
            return event.sender.Dispatch('CloseClicked', args);
        }
    }

    /**
     * @ignore
     * @private
     * @param {Colibri.Events.Event} event event object
     * @param {*} args event arguments
     */
    __tabButtonCloseClicked(event, args) {

        this.RemoveFromLocalStore(event.sender.tag.route);

        const currentIndex = event.sender.container.index();

        event.sender.Dispose();
        event.sender.tag.container.Dispose();

        if (currentIndex == 0 && this.tabsCount > 0) {
            this.selectedIndex = 0;
        }
        else if (currentIndex > 0) {
            this.selectedIndex = currentIndex - 1;
        }
        else {
            this.Dispatch('SelectionChanged', { domEvent: args.domEvent, name: null });
        }

        args.domEvent.stopPropagation();
        args.domEvent.preventDefault();
        return false;
    }

    /**
     * @ignore
     * @private
     * @param {String} title tab title
     * @param {String} route tab route
     * @param {String} icon tab icon
     * @param {Colibri.UI.Component} containerComponent tab container component
     * @returns {App.Modules.MainFrame.MainTabs.Button} created tab button
     */
    _createTabButton(title, route, icon, containerComponent) {
        const tabButton = new App.Modules.MainFrame.MainTabs.Button(route.replaceAll('/', '_'), this.header);
        tabButton.value = title;
        tabButton.closable = true;
        tabButton.parent = this;
        tabButton.icon = icon;
        tabButton.tag = { title: title, route: route, icon: icon, container: containerComponent };
        tabButton.AddHandler('MouseUp', this.__tabButtonMouseUp, false, this);
        tabButton.AddHandler('CloseClicked', this.__tabButtonCloseClicked, false, this);

        this.Dispatch('TabClicked', { tab: tabButton });
        tabButton.Redirect = (route) => {
            this.ReplaceInLocalStore(tabButton.tag.route, route);
            tabButton.tag.route = route;
            this.Dispatch('SelectionChanged', { tab: tabButton });
        };
        return tabButton;
    }

    /**
     * Adds a new tab
     * @param {String} title tab title
     * @param {String} route tab route
     * @param {String} icon tab icon
     * @param {Colibri.UI.Component} containerComponent tab container component
     * @returns {void}
     * @public
     */
    AddTab(title, route, icon, containerComponent) {
        const tabName = route.replaceAll('/', '_');
        let tabButton = this.Children(tabName);
        if (tabButton) {
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

    /**
     * Remove the tab from saved tabs in local storage
     * @param {String} route tab route
     * @returns {void}
     * @public
     */
    RemoveFromLocalStore(route) {
        const index = this._localStore.indexOf(route);
        this._localStore.splice(index, 1);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    /**
     * Replace the tab in saved tabs in local storage
     * @param {String} route1 tab route to replace
     * @param {String} route2 tab route to replace with
     * @returns {void}
     * @public
     */
    ReplaceInLocalStore(route1, route2) {

        const index = this._localStore.indexOf(route1);
        if (index === -1) {
            return;
        }

        this._localStore.splice(index, 1, route2);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    /**
     * Save the tab in saved tabs in local storage
     * @param {String} route tab route
     * @returns {void}
     * @public
     */
    SaveToLocalStore(route) {
        const index = this._localStore.indexOf(route);
        if (index !== -1) {
            return;
        }

        this._localStore.push(route);
        window.localStorage.setItem('open-tabs', JSON.stringify(this._localStore));
    }

    /**
     * Restore the tabs from saved tabs in local storage
     * @returns {void}
     * @public
     */
    RestoreFromLocalStore() {
        this._localStore = JSON.parse(window.localStorage.getItem('open-tabs'));
        if (!Array.isArray(this._localStore)) {
            this._localStore = [];
        }
    }

    /**
     * Saved tabs in local storage
     * @type {Array}
     */
    get savedTabs() {
        return this._localStore;
    }

}
