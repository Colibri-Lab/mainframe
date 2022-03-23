App.Modules.MainFrame.MainPage = class extends Colibri.UI.Component {

    constructor(name, container) {
        /* создаем компонент и передаем шаблон */
        super(name, container, Colibri.UI.Templates['App.Modules.MainFrame.MainPage']);

        this.AddClass('app-main-page-component');

        this._tabLocations = [];
        this.RestoreFromLocalStorage();

        this._tabs = this.Children('page-content-tabs');
        this._tabs.AddHandler('SelectionChanged', (event, args) => {
            this.SelectByName(args.name);
        });

        this._tabs.AddHandler('SearchButtonClicked', (event, args) => {
            this.AddTab('tab' + Date.Now().getTime(), 'Вкладка ' + this._tabs.tabsCount, 'orange', true, 'tab-container' + Date.Now().getTime(), () => {}, '/tab-' + Date.Now().getTime() + '/');
        });

        this.OpenStoredTabs();


    }

    get user() {
        return this._userData;
    }

    set user(value) {
        this._userData = value;   
    }

    ShowCompaniesDropDown() {
        this.Children('app-module-header').ShowCompaniesDropDown();
    }

    ShowProfilesDropDown() {
        this.Children('app-module-header').ShowProfilesDropDown();
    }

    ShowHelpWindow() {
        this.Children('app-module-header').ShowHelpWindow();
    }

    ShowCometDropDown() {
        this.Children('app-module-header').ShowCometDropDown();
    }

    ShowArchiveDropDown() {
        this.Children('app-module-header').ShowArchiveDropDown();
    }

    AddTab(name, title, color, closable, containerName, closeClicked, hash, index = null) {
        
        if(this._tabs.Children(name)) {
            const tab = this._tabs.Children(containerName);
            this._tabs.selectedTab = name;
            return tab;
        }
        
        const container = new Colibri.UI.Pane(containerName, this._tabs);
        this._tabs.AddTab(name, title, color, closable, container, () => { 
            this.RemoveFromLocations(hash, name);
            closeClicked();
        }, index);
        this.AddToLocations(hash, name);
        this._tabs.selectedTab = name;
        return container;

    }

    SelectTab(container) {
        const index = container.container.index();
        this._tabs.selectedIndex = index;
    }

    AddToLocations(hash, name) {
        let found = false;
        this._tabLocations.forEach((v) => {
            if(v.hash === hash && v.name === name) {
                found = true;
                return false;
            }
            return true;
        });
        if(!found) {
            this._tabLocations.push({hash: hash, name: name});
            this.StoreToLocalStorage();
        }
    }

    RemoveFromLocations(hash, name) {
        let ret = [];
        this._tabLocations.forEach((v) => {
            if(v.hash !== hash && v.name !== name) {
                ret.push(v);
            }
        });
        this._tabLocations = ret;
        this.StoreToLocalStorage();
    }

    SelectByName(name) {
        this._tabLocations.forEach((tab) => {
            if(tab.name === name) {
                history.pushState({}, '', '#' + tab.hash);
            }
        });
    }

    RestoreFromLocalStorage() {
        this._tabLocations = window.localStorage.getItem('gb-opened-tabs');
        if(!this._tabLocations) {
            this._tabLocations = [];
        }
        else {
            this._tabLocations = JSON.parse(this._tabLocations);
        }
    }

    StoreToLocalStorage() {
        window.localStorage.setItem('gb-opened-tabs', JSON.stringify(this._tabLocations));
    }

    OpenStoredTabs() {

        Colibri.Common.Tick(this._tabLocations, 1000, (v) => {
            location.hash = v.hash;
        });

    }

}